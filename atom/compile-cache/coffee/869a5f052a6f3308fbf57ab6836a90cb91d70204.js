(function() {
  var Mutation, MutationManager, Point, getFirstCharacterPositionForBufferRow, getVimLastBufferRow, ref, swrap,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Point = require('atom').Point;

  ref = require('./utils'), getFirstCharacterPositionForBufferRow = ref.getFirstCharacterPositionForBufferRow, getVimLastBufferRow = ref.getVimLastBufferRow;

  swrap = require('./selection-wrapper');

  module.exports = MutationManager = (function() {
    function MutationManager(vimState) {
      this.vimState = vimState;
      this.destroy = bind(this.destroy, this);
      this.editor = this.vimState.editor;
      this.vimState.onDidDestroy(this.destroy);
      this.markerLayer = this.editor.addMarkerLayer();
      this.mutationsBySelection = new Map;
    }

    MutationManager.prototype.destroy = function() {
      this.markerLayer.destroy();
      return this.mutationsBySelection.clear();
    };

    MutationManager.prototype.init = function(arg) {
      this.stayByMarker = arg.stayByMarker;
      return this.reset();
    };

    MutationManager.prototype.reset = function() {
      this.markerLayer.clear();
      return this.mutationsBySelection.clear();
    };

    MutationManager.prototype.setCheckpoint = function(checkpoint) {
      var i, len, ref1, results, selection;
      ref1 = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        selection = ref1[i];
        results.push(this.setCheckpointForSelection(selection, checkpoint));
      }
      return results;
    };

    MutationManager.prototype.setCheckpointForSelection = function(selection, checkpoint) {
      var initialPoint, initialPointMarker, marker, options, resetMarker;
      if (this.mutationsBySelection.has(selection)) {
        resetMarker = !selection.getBufferRange().isEmpty();
      } else {
        resetMarker = true;
        initialPoint = swrap(selection).getBufferPositionFor('head', {
          from: ['property', 'selection']
        });
        if (this.stayByMarker) {
          initialPointMarker = this.markerLayer.markBufferPosition(initialPoint, {
            invalidate: 'never'
          });
        }
        options = {
          selection: selection,
          initialPoint: initialPoint,
          initialPointMarker: initialPointMarker,
          checkpoint: checkpoint
        };
        this.mutationsBySelection.set(selection, new Mutation(options));
      }
      if (resetMarker) {
        marker = this.markerLayer.markBufferRange(selection.getBufferRange(), {
          invalidate: 'never'
        });
      }
      return this.mutationsBySelection.get(selection).update(checkpoint, marker, this.vimState.mode);
    };

    MutationManager.prototype.migrateMutation = function(oldSelection, newSelection) {
      var mutation;
      mutation = this.mutationsBySelection.get(oldSelection);
      this.mutationsBySelection["delete"](oldSelection);
      mutation.selection = newSelection;
      return this.mutationsBySelection.set(newSelection, mutation);
    };

    MutationManager.prototype.getMutatedBufferRangeForSelection = function(selection) {
      if (this.mutationsBySelection.has(selection)) {
        return this.mutationsBySelection.get(selection).marker.getBufferRange();
      }
    };

    MutationManager.prototype.getSelectedBufferRangesForCheckpoint = function(checkpoint) {
      var ranges;
      ranges = [];
      this.mutationsBySelection.forEach(function(mutation) {
        var range;
        if (range = mutation.bufferRangeByCheckpoint[checkpoint]) {
          return ranges.push(range);
        }
      });
      return ranges;
    };

    MutationManager.prototype.restoreCursorPositions = function(arg) {
      var blockwiseSelection, head, i, j, k, len, len1, len2, mutation, point, ref1, ref2, ref3, ref4, results, results1, selection, setToFirstCharacterOnLinewise, stay, tail, wise;
      stay = arg.stay, wise = arg.wise, setToFirstCharacterOnLinewise = arg.setToFirstCharacterOnLinewise;
      if (wise === 'blockwise') {
        ref1 = this.vimState.getBlockwiseSelections();
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
          blockwiseSelection = ref1[i];
          ref2 = blockwiseSelection.getProperties(), head = ref2.head, tail = ref2.tail;
          point = stay ? head : Point.min(head, tail);
          blockwiseSelection.setHeadBufferPosition(point);
          results.push(blockwiseSelection.skipNormalization());
        }
        return results;
      } else {
        ref3 = this.editor.getSelections();
        for (j = 0, len1 = ref3.length; j < len1; j++) {
          selection = ref3[j];
          if (mutation = this.mutationsBySelection.get(selection)) {
            if (mutation.createdAt !== 'will-select') {
              selection.destroy();
            }
          }
        }
        ref4 = this.editor.getSelections();
        results1 = [];
        for (k = 0, len2 = ref4.length; k < len2; k++) {
          selection = ref4[k];
          if (!(mutation = this.mutationsBySelection.get(selection))) {
            continue;
          }
          if (stay) {
            point = this.clipPoint(mutation.getStayPosition(wise));
          } else {
            point = this.clipPoint(mutation.startPositionOnDidSelect);
            if (setToFirstCharacterOnLinewise && wise === 'linewise') {
              point = getFirstCharacterPositionForBufferRow(this.editor, point.row);
            }
          }
          results1.push(selection.cursor.setBufferPosition(point));
        }
        return results1;
      }
    };

    MutationManager.prototype.clipPoint = function(point) {
      point.row = Math.min(getVimLastBufferRow(this.editor), point.row);
      return this.editor.clipBufferPosition(point);
    };

    return MutationManager;

  })();

  Mutation = (function() {
    function Mutation(options) {
      var checkpoint;
      this.selection = options.selection, this.initialPoint = options.initialPoint, this.initialPointMarker = options.initialPointMarker, checkpoint = options.checkpoint;
      this.createdAt = checkpoint;
      this.bufferRangeByCheckpoint = {};
      this.marker = null;
      this.startPositionOnDidSelect = null;
    }

    Mutation.prototype.update = function(checkpoint, marker, mode) {
      var from, ref1;
      if (marker != null) {
        if ((ref1 = this.marker) != null) {
          ref1.destroy();
        }
        this.marker = marker;
      }
      this.bufferRangeByCheckpoint[checkpoint] = this.marker.getBufferRange();
      if (checkpoint === 'did-select') {
        if (mode === 'visual' && !this.selection.isReversed()) {
          from = ['selection'];
        } else {
          from = ['property', 'selection'];
        }
        return this.startPositionOnDidSelect = swrap(this.selection).getBufferPositionFor('start', {
          from: from
        });
      }
    };

    Mutation.prototype.getStayPosition = function(wise) {
      var end, point, ref1, ref2, ref3, ref4, selectedRange, start;
      point = (ref1 = (ref2 = this.initialPointMarker) != null ? ref2.getHeadBufferPosition() : void 0) != null ? ref1 : this.initialPoint;
      selectedRange = (ref3 = this.bufferRangeByCheckpoint['did-select-occurrence']) != null ? ref3 : this.bufferRangeByCheckpoint['did-select'];
      if (selectedRange.isEqual(this.marker.getBufferRange())) {
        return point;
      } else {
        ref4 = this.marker.getBufferRange(), start = ref4.start, end = ref4.end;
        end = Point.max(start, end.translate([0, -1]));
        if (wise === 'linewise') {
          point.row = Math.min(end.row, point.row);
          return point;
        } else {
          return Point.min(end, point);
        }
      }
    };

    return Mutation;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2FydHJlLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL211dGF0aW9uLW1hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx3R0FBQTtJQUFBOztFQUFDLFFBQVMsT0FBQSxDQUFRLE1BQVI7O0VBQ1YsTUFBK0QsT0FBQSxDQUFRLFNBQVIsQ0FBL0QsRUFBQyxpRkFBRCxFQUF3Qzs7RUFDeEMsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUjs7RUFFUixNQUFNLENBQUMsT0FBUCxHQUNNO0lBQ1MseUJBQUMsUUFBRDtNQUFDLElBQUMsQ0FBQSxXQUFEOztNQUNYLElBQUMsQ0FBQSxTQUFVLElBQUMsQ0FBQSxTQUFYO01BRUYsSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENBQXVCLElBQUMsQ0FBQSxPQUF4QjtNQUVBLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQUE7TUFDZixJQUFDLENBQUEsb0JBQUQsR0FBd0IsSUFBSTtJQU5qQjs7OEJBUWIsT0FBQSxHQUFTLFNBQUE7TUFDUCxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsQ0FBQTthQUNBLElBQUMsQ0FBQSxvQkFBb0IsQ0FBQyxLQUF0QixDQUFBO0lBRk87OzhCQUlULElBQUEsR0FBTSxTQUFDLEdBQUQ7TUFBRSxJQUFDLENBQUEsZUFBRixJQUFFO2FBQ1AsSUFBQyxDQUFBLEtBQUQsQ0FBQTtJQURJOzs4QkFHTixLQUFBLEdBQU8sU0FBQTtNQUNMLElBQUMsQ0FBQSxXQUFXLENBQUMsS0FBYixDQUFBO2FBQ0EsSUFBQyxDQUFBLG9CQUFvQixDQUFDLEtBQXRCLENBQUE7SUFGSzs7OEJBSVAsYUFBQSxHQUFlLFNBQUMsVUFBRDtBQUNiLFVBQUE7QUFBQTtBQUFBO1dBQUEsc0NBQUE7O3FCQUNFLElBQUMsQ0FBQSx5QkFBRCxDQUEyQixTQUEzQixF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LEdBQU4sQ0FBVSxLQUFWLEVBQWlCLEdBQUcsQ0FBQyxTQUFKLENBQWMsQ0FBQyxDQUFELEVBQUksQ0FBQyxDQUFMLENBQWQsQ0FBakI7UUFDTixJQUFHLElBQUEsS0FBUSxVQUFYO1VBQ0UsS0FBSyxDQUFDLEdBQU4sR0FBWSxJQUFJLENBQUMsR0FBTCxDQUFTLEdBQUcsQ0FBQyxHQUFiLEVBQWtCLEtBQUssQ0FBQyxHQUF4QjtpQkFDWixNQUZGO1NBQUEsTUFBQTtpQkFJRSxLQUFLLENBQUMsR0FBTixDQUFVLEdBQVYsRUFBZSxLQUFmLEVBSkY7U0FMRjs7SUFIZTs7Ozs7QUF0SG5CIiwic291cmNlc0NvbnRlbnQiOlsie1BvaW50fSA9IHJlcXVpcmUgJ2F0b20nXG57Z2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdywgZ2V0VmltTGFzdEJ1ZmZlclJvd30gPSByZXF1aXJlICcuL3V0aWxzJ1xuc3dyYXAgPSByZXF1aXJlICcuL3NlbGVjdGlvbi13cmFwcGVyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBNdXRhdGlvbk1hbmFnZXJcbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3J9ID0gQHZpbVN0YXRlXG5cbiAgICBAdmltU3RhdGUub25EaWREZXN0cm95KEBkZXN0cm95KVxuXG4gICAgQG1hcmtlckxheWVyID0gQGVkaXRvci5hZGRNYXJrZXJMYXllcigpXG4gICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uID0gbmV3IE1hcFxuXG4gIGRlc3Ryb3k6ID0+XG4gICAgQG1hcmtlckxheWVyLmRlc3Ryb3koKVxuICAgIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5jbGVhcigpXG5cbiAgaW5pdDogKHtAc3RheUJ5TWFya2VyfSkgLT5cbiAgICBAcmVzZXQoKVxuXG4gIHJlc2V0OiAtPlxuICAgIEBtYXJrZXJMYXllci5jbGVhcigpXG4gICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uLmNsZWFyKClcblxuICBzZXRDaGVja3BvaW50OiAoY2hlY2twb2ludCkgLT5cbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICBAc2V0Q2hlY2twb2ludEZvclNlbGVjdGlvbihzZWxlY3Rpb24sIGNoZWNrcG9pbnQpXG5cbiAgc2V0Q2hlY2twb2ludEZvclNlbGVjdGlvbjogKHNlbGVjdGlvbiwgY2hlY2twb2ludCkgLT5cbiAgICBpZiBAbXV0YXRpb25zQnlTZWxlY3Rpb24uaGFzKHNlbGVjdGlvbilcbiAgICAgICMgQ3VycmVudCBub24tZW1wdHkgc2VsZWN0aW9uIGlzIHByaW9yaXRpemVkIG92ZXIgZXhpc3RpbmcgbWFya2VyJ3MgcmFuZ2UuXG4gICAgICAjIFdlIGludmFsaWRhdGUgb2xkIG1hcmtlciB0byByZS10cmFjayBmcm9tIGN1cnJlbnQgc2VsZWN0aW9uLlxuICAgICAgcmVzZXRNYXJrZXIgPSBub3Qgc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuaXNFbXB0eSgpXG4gICAgZWxzZVxuICAgICAgcmVzZXRNYXJrZXIgPSB0cnVlXG4gICAgICBpbml0aWFsUG9pbnQgPSBzd3JhcChzZWxlY3Rpb24pLmdldEJ1ZmZlclBvc2l0aW9uRm9yKCdoZWFkJywgZnJvbTogWydwcm9wZXJ0eScsICdzZWxlY3Rpb24nXSlcbiAgICAgIGlmIEBzdGF5QnlNYXJrZXJcbiAgICAgICAgaW5pdGlhbFBvaW50TWFya2VyID0gQG1hcmtlckxheWVyLm1hcmtCdWZmZXJQb3NpdGlvbihpbml0aWFsUG9pbnQsIGludmFsaWRhdGU6ICduZXZlcicpXG5cbiAgICAgIG9wdGlvbnMgPSB7c2VsZWN0aW9uLCBpbml0aWFsUG9pbnQsIGluaXRpYWxQb2ludE1hcmtlciwgY2hlY2twb2ludH1cbiAgICAgIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5zZXQoc2VsZWN0aW9uLCBuZXcgTXV0YXRpb24ob3B0aW9ucykpXG5cbiAgICBpZiByZXNldE1hcmtlclxuICAgICAgbWFya2VyID0gQG1hcmtlckxheWVyLm1hcmtCdWZmZXJSYW5nZShzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKSwgaW52YWxpZGF0ZTogJ25ldmVyJylcbiAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbikudXBkYXRlKGNoZWNrcG9pbnQsIG1hcmtlciwgQHZpbVN0YXRlLm1vZGUpXG5cbiAgbWlncmF0ZU11dGF0aW9uOiAob2xkU2VsZWN0aW9uLCBuZXdTZWxlY3Rpb24pIC0+XG4gICAgbXV0YXRpb24gPSBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KG9sZFNlbGVjdGlvbilcbiAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZGVsZXRlKG9sZFNlbGVjdGlvbilcbiAgICBtdXRhdGlvbi5zZWxlY3Rpb24gPSBuZXdTZWxlY3Rpb25cbiAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24uc2V0KG5ld1NlbGVjdGlvbiwgbXV0YXRpb24pXG5cbiAgZ2V0TXV0YXRlZEJ1ZmZlclJhbmdlRm9yU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIGlmIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5oYXMoc2VsZWN0aW9uKVxuICAgICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pLm1hcmtlci5nZXRCdWZmZXJSYW5nZSgpXG5cbiAgZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXNGb3JDaGVja3BvaW50OiAoY2hlY2twb2ludCkgLT5cbiAgICByYW5nZXMgPSBbXVxuICAgIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5mb3JFYWNoIChtdXRhdGlvbikgLT5cbiAgICAgIGlmIHJhbmdlID0gbXV0YXRpb24uYnVmZmVyUmFuZ2VCeUNoZWNrcG9pbnRbY2hlY2twb2ludF1cbiAgICAgICAgcmFuZ2VzLnB1c2gocmFuZ2UpXG4gICAgcmFuZ2VzXG5cbiAgcmVzdG9yZUN1cnNvclBvc2l0aW9uczogKHtzdGF5LCB3aXNlLCBzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZX0pIC0+XG4gICAgaWYgd2lzZSBpcyAnYmxvY2t3aXNlJ1xuICAgICAgZm9yIGJsb2Nrd2lzZVNlbGVjdGlvbiBpbiBAdmltU3RhdGUuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpXG4gICAgICAgIHtoZWFkLCB0YWlsfSA9IGJsb2Nrd2lzZVNlbGVjdGlvbi5nZXRQcm9wZXJ0aWVzKClcbiAgICAgICAgcG9pbnQgPSBpZiBzdGF5IHRoZW4gaGVhZCBlbHNlIFBvaW50Lm1pbihoZWFkLCB0YWlsKVxuICAgICAgICBibG9ja3dpc2VTZWxlY3Rpb24uc2V0SGVhZEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgICAgICBibG9ja3dpc2VTZWxlY3Rpb24uc2tpcE5vcm1hbGl6YXRpb24oKVxuICAgIGVsc2VcbiAgICAgICMgTWFrZSBzdXJlIGRlc3Ryb3lpbmcgYWxsIHRlbXBvcmFsIHNlbGVjdGlvbiBCRUZPUkUgc3RhcnRpbmcgdG8gc2V0IGN1cnNvcnMgdG8gZmluYWwgcG9zaXRpb24uXG4gICAgICAjIFRoaXMgaXMgaW1wb3J0YW50IHRvIGF2b2lkIGRlc3Ryb3kgb3JkZXIgZGVwZW5kZW50IGJ1Z3MuXG4gICAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpIHdoZW4gbXV0YXRpb24gPSBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbilcbiAgICAgICAgaWYgbXV0YXRpb24uY3JlYXRlZEF0IGlzbnQgJ3dpbGwtc2VsZWN0J1xuICAgICAgICAgIHNlbGVjdGlvbi5kZXN0cm95KClcblxuICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKSB3aGVuIG11dGF0aW9uID0gQG11dGF0aW9uc0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pXG4gICAgICAgIGlmIHN0YXlcbiAgICAgICAgICBwb2ludCA9IEBjbGlwUG9pbnQobXV0YXRpb24uZ2V0U3RheVBvc2l0aW9uKHdpc2UpKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgcG9pbnQgPSBAY2xpcFBvaW50KG11dGF0aW9uLnN0YXJ0UG9zaXRpb25PbkRpZFNlbGVjdClcbiAgICAgICAgICBpZiBzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZSBhbmQgd2lzZSBpcyAnbGluZXdpc2UnXG4gICAgICAgICAgICBwb2ludCA9IGdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3coQGVkaXRvciwgcG9pbnQucm93KVxuICAgICAgICBzZWxlY3Rpb24uY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG4gIGNsaXBQb2ludDogKHBvaW50KSAtPlxuICAgIHBvaW50LnJvdyA9IE1hdGgubWluKGdldFZpbUxhc3RCdWZmZXJSb3coQGVkaXRvciksIHBvaW50LnJvdylcbiAgICBAZWRpdG9yLmNsaXBCdWZmZXJQb3NpdGlvbihwb2ludClcblxuIyBNdXRhdGlvbiBpbmZvcm1hdGlvbiBpcyBjcmVhdGVkIGV2ZW4gaWYgc2VsZWN0aW9uLmlzRW1wdHkoKVxuIyBTbyB0aGF0IHdlIGNhbiBmaWx0ZXIgc2VsZWN0aW9uIGJ5IHdoZW4gaXQgd2FzIGNyZWF0ZWQuXG4jICBlLmcuIFNvbWUgc2VsZWN0aW9uIGlzIGNyZWF0ZWQgYXQgJ3dpbGwtc2VsZWN0JyBjaGVja3BvaW50LCBvdGhlcnMgYXQgJ2RpZC1zZWxlY3QnIG9yICdkaWQtc2VsZWN0LW9jY3VycmVuY2UnXG5jbGFzcyBNdXRhdGlvblxuICBjb25zdHJ1Y3RvcjogKG9wdGlvbnMpIC0+XG4gICAge0BzZWxlY3Rpb24sIEBpbml0aWFsUG9pbnQsIEBpbml0aWFsUG9pbnRNYXJrZXIsIGNoZWNrcG9pbnR9ID0gb3B0aW9uc1xuICAgIEBjcmVhdGVkQXQgPSBjaGVja3BvaW50XG4gICAgQGJ1ZmZlclJhbmdlQnlDaGVja3BvaW50ID0ge31cbiAgICBAbWFya2VyID0gbnVsbFxuICAgIEBzdGFydFBvc2l0aW9uT25EaWRTZWxlY3QgPSBudWxsXG5cbiAgdXBkYXRlOiAoY2hlY2twb2ludCwgbWFya2VyLCBtb2RlKSAtPlxuICAgIGlmIG1hcmtlcj9cbiAgICAgIEBtYXJrZXI/LmRlc3Ryb3koKVxuICAgICAgQG1hcmtlciA9IG1hcmtlclxuICAgIEBidWZmZXJSYW5nZUJ5Q2hlY2twb2ludFtjaGVja3BvaW50XSA9IEBtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICMgTk9URTogc3R1cGlkbHkgcmVzcGVjdCBwdXJlLVZpbSdzIGJlaGF2aW9yIHdoaWNoIGlzIGluY29uc2lzdGVudC5cbiAgICAjIE1heWJlIEknbGwgcmVtb3ZlIHRoaXMgYmxpbmRseS1mb2xsb3dpbmctdG8tcHVyZS1WaW0gY29kZS5cbiAgICAjICAtIGBWIGsgeWA6IGRvbid0IG1vdmUgY3Vyc29yXG4gICAgIyAgLSBgViBqIHlgOiBtb3ZlIGN1cm9yIHRvIHN0YXJ0IG9mIHNlbGVjdGVkIGxpbmUuKEluY29uc2lzdGVudCEpXG4gICAgaWYgY2hlY2twb2ludCBpcyAnZGlkLXNlbGVjdCdcbiAgICAgIGlmIChtb2RlIGlzICd2aXN1YWwnIGFuZCBub3QgQHNlbGVjdGlvbi5pc1JldmVyc2VkKCkpXG4gICAgICAgIGZyb20gPSBbJ3NlbGVjdGlvbiddXG4gICAgICBlbHNlXG4gICAgICAgIGZyb20gPSBbJ3Byb3BlcnR5JywgJ3NlbGVjdGlvbiddXG4gICAgICBAc3RhcnRQb3NpdGlvbk9uRGlkU2VsZWN0ID0gc3dyYXAoQHNlbGVjdGlvbikuZ2V0QnVmZmVyUG9zaXRpb25Gb3IoJ3N0YXJ0Jywge2Zyb219KVxuXG4gIGdldFN0YXlQb3NpdGlvbjogKHdpc2UpIC0+XG4gICAgcG9pbnQgPSBAaW5pdGlhbFBvaW50TWFya2VyPy5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKSA/IEBpbml0aWFsUG9pbnRcbiAgICBzZWxlY3RlZFJhbmdlID0gQGJ1ZmZlclJhbmdlQnlDaGVja3BvaW50WydkaWQtc2VsZWN0LW9jY3VycmVuY2UnXSA/IEBidWZmZXJSYW5nZUJ5Q2hlY2twb2ludFsnZGlkLXNlbGVjdCddXG4gICAgaWYgc2VsZWN0ZWRSYW5nZS5pc0VxdWFsKEBtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKSkgIyBDaGVjayBpZiBuZWVkIENsaXBcbiAgICAgIHBvaW50XG4gICAgZWxzZVxuICAgICAge3N0YXJ0LCBlbmR9ID0gQG1hcmtlci5nZXRCdWZmZXJSYW5nZSgpXG4gICAgICBlbmQgPSBQb2ludC5tYXgoc3RhcnQsIGVuZC50cmFuc2xhdGUoWzAsIC0xXSkpXG4gICAgICBpZiB3aXNlIGlzICdsaW5ld2lzZSdcbiAgICAgICAgcG9pbnQucm93ID0gTWF0aC5taW4oZW5kLnJvdywgcG9pbnQucm93KVxuICAgICAgICBwb2ludFxuICAgICAgZWxzZVxuICAgICAgICBQb2ludC5taW4oZW5kLCBwb2ludClcbiJdfQ==
