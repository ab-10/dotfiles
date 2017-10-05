(function() {
  var CompositeDisposable, CursorStyleManager, Delegato, Disposable, Point, ref, swrap,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Point = ref.Point, Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  Delegato = require('delegato');

  swrap = require('./selection-wrapper');

  CursorStyleManager = (function() {
    CursorStyleManager.prototype.lineHeight = null;

    Delegato.includeInto(CursorStyleManager);

    CursorStyleManager.delegatesProperty('mode', 'submode', {
      toProperty: 'vimState'
    });

    function CursorStyleManager(vimState) {
      var ref1;
      this.vimState = vimState;
      this.refresh = bind(this.refresh, this);
      this.destroy = bind(this.destroy, this);
      ref1 = this.vimState, this.editorElement = ref1.editorElement, this.editor = ref1.editor;
      this.disposables = new CompositeDisposable;
      this.disposables.add(atom.config.observe('editor.lineHeight', this.refresh));
      this.disposables.add(atom.config.observe('editor.fontSize', this.refresh));
      this.vimState.onDidDestroy(this.destroy);
    }

    CursorStyleManager.prototype.destroy = function() {
      var ref1;
      if ((ref1 = this.styleDisposables) != null) {
        ref1.dispose();
      }
      return this.disposables.dispose();
    };

    CursorStyleManager.prototype.refresh = function() {
      var cursor, cursorNode, cursorNodesById, cursorsToShow, i, j, len, len1, ref1, ref2, results;
      if (atom.inSpecMode()) {
        return;
      }
      this.lineHeight = this.editor.getLineHeightInPixels();
      if ((ref1 = this.styleDisposables) != null) {
        ref1.dispose();
      }
      if (this.mode !== 'visual') {
        return;
      }
      this.styleDisposables = new CompositeDisposable;
      if (this.submode === 'blockwise') {
        cursorsToShow = this.vimState.getBlockwiseSelections().map(function(bs) {
          return bs.getHeadSelection().cursor;
        });
      } else {
        cursorsToShow = this.editor.getCursors();
      }
      ref2 = this.editor.getCursors();
      for (i = 0, len = ref2.length; i < len; i++) {
        cursor = ref2[i];
        cursor.setVisible(indexOf.call(cursorsToShow, cursor) >= 0);
      }
      this.editorElement.component.updateSync();
      cursorNodesById = this.editorElement.component.linesComponent.cursorsComponent.cursorNodesById;
      results = [];
      for (j = 0, len1 = cursorsToShow.length; j < len1; j++) {
        cursor = cursorsToShow[j];
        if (cursorNode = cursorNodesById[cursor.id]) {
          results.push(this.styleDisposables.add(this.modifyStyle(cursor, cursorNode)));
        }
      }
      return results;
    };

    CursorStyleManager.prototype.getCursorBufferPositionToDisplay = function(selection) {
      var bufferPosition, bufferPositionToDisplay, screenPosition;
      bufferPosition = swrap(selection).getBufferPositionFor('head', {
        from: ['property']
      });
      if (this.editor.hasAtomicSoftTabs() && !selection.isReversed()) {
        screenPosition = this.editor.screenPositionForBufferPosition(bufferPosition.translate([0, +1]), {
          clipDirection: 'forward'
        });
        bufferPositionToDisplay = this.editor.bufferPositionForScreenPosition(screenPosition).translate([0, -1]);
        if (bufferPositionToDisplay.isGreaterThan(bufferPosition)) {
          bufferPosition = bufferPositionToDisplay;
        }
      }
      return this.editor.clipBufferPosition(bufferPosition);
    };

    CursorStyleManager.prototype.modifyStyle = function(cursor, domNode) {
      var bufferPosition, column, ref1, ref2, row, screenPosition, selection, style;
      selection = cursor.selection;
      bufferPosition = this.getCursorBufferPositionToDisplay(selection);
      if (this.submode === 'linewise' && this.editor.isSoftWrapped()) {
        screenPosition = this.editor.screenPositionForBufferPosition(bufferPosition);
        ref1 = screenPosition.traversalFrom(cursor.getScreenPosition()), row = ref1.row, column = ref1.column;
      } else {
        ref2 = bufferPosition.traversalFrom(cursor.getBufferPosition()), row = ref2.row, column = ref2.column;
      }
      style = domNode.style;
      if (row) {
        style.setProperty('top', (this.lineHeight * row) + "px");
      }
      if (column) {
        style.setProperty('left', column + "ch");
      }
      return new Disposable(function() {
        style.removeProperty('top');
        return style.removeProperty('left');
      });
    };

    return CursorStyleManager;

  })();

  module.exports = CursorStyleManager;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2FydHJlLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2N1cnNvci1zdHlsZS1tYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsZ0ZBQUE7SUFBQTs7O0VBQUEsTUFBMkMsT0FBQSxDQUFRLE1BQVIsQ0FBM0MsRUFBQyxpQkFBRCxFQUFRLDJCQUFSLEVBQW9COztFQUNwQixRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0VBQ1gsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUjs7RUFJRjtpQ0FDSixVQUFBLEdBQVk7O0lBRVosUUFBUSxDQUFDLFdBQVQsQ0FBcUIsa0JBQXJCOztJQUNBLGtCQUFDLENBQUEsaUJBQUQsQ0FBbUIsTUFBbkIsRUFBMkIsU0FBM0IsRUFBc0M7TUFBQSxVQUFBLEVBQVksVUFBWjtLQUF0Qzs7SUFFYSw0QkFBQyxRQUFEO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxXQUFEOzs7TUFDWixPQUE0QixJQUFDLENBQUEsUUFBN0IsRUFBQyxJQUFDLENBQUEscUJBQUEsYUFBRixFQUFpQixJQUFDLENBQUEsY0FBQTtNQUNsQixJQUFDLENBQUEsV0FBRCxHQUFlLElBQUk7TUFDbkIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixtQkFBcEIsRUFBeUMsSUFBQyxDQUFBLE9BQTFDLENBQWpCO01BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixpQkFBcEIsRUFBdUMsSUFBQyxDQUFBLE9BQXhDLENBQWpCO01BQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENBQXVCLElBQUMsQ0FBQSxPQUF4QjtJQUxXOztpQ0FPYixPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7O1lBQWlCLENBQUUsT0FB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LHFCQUZSO09BQUEsTUFBQTtRQUlFLE9BQWdCLGNBQWMsQ0FBQyxhQUFmLENBQTZCLE1BQU0sQ0FBQyxpQkFBUCxDQUFBLENBQTdCLENBQWhCLEVBQUMsY0FBRCxFQUFNLHFCQUpSOztNQU1BLEtBQUEsR0FBUSxPQUFPLENBQUM7TUFDaEIsSUFBc0QsR0FBdEQ7UUFBQSxLQUFLLENBQUMsV0FBTixDQUFrQixLQUFsQixFQUEyQixDQUFDLElBQUMsQ0FBQSxVQUFELEdBQWMsR0FBZixDQUFBLEdBQW1CLElBQTlDLEVBQUE7O01BQ0EsSUFBNEMsTUFBNUM7UUFBQSxLQUFLLENBQUMsV0FBTixDQUFrQixNQUFsQixFQUE2QixNQUFELEdBQVEsSUFBcEMsRUFBQTs7YUFDSSxJQUFBLFVBQUEsQ0FBVyxTQUFBO1FBQ2IsS0FBSyxDQUFDLGNBQU4sQ0FBcUIsS0FBckI7ZUFDQSxLQUFLLENBQUMsY0FBTixDQUFxQixNQUFyQjtNQUZhLENBQVg7SUFiTzs7Ozs7O0VBaUJmLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBL0VqQiIsInNvdXJjZXNDb250ZW50IjpbIntQb2ludCwgRGlzcG9zYWJsZSwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuRGVsZWdhdG8gPSByZXF1aXJlICdkZWxlZ2F0bydcbnN3cmFwID0gcmVxdWlyZSAnLi9zZWxlY3Rpb24td3JhcHBlcidcblxuIyBEaXNwbGF5IGN1cnNvciBpbiB2aXN1YWwtbW9kZVxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBDdXJzb3JTdHlsZU1hbmFnZXJcbiAgbGluZUhlaWdodDogbnVsbFxuXG4gIERlbGVnYXRvLmluY2x1ZGVJbnRvKHRoaXMpXG4gIEBkZWxlZ2F0ZXNQcm9wZXJ0eSgnbW9kZScsICdzdWJtb2RlJywgdG9Qcm9wZXJ0eTogJ3ZpbVN0YXRlJylcblxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvckVsZW1lbnQsIEBlZGl0b3J9ID0gQHZpbVN0YXRlXG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUoJ2VkaXRvci5saW5lSGVpZ2h0JywgQHJlZnJlc2gpXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlKCdlZGl0b3IuZm9udFNpemUnLCBAcmVmcmVzaClcbiAgICBAdmltU3RhdGUub25EaWREZXN0cm95KEBkZXN0cm95KVxuXG4gIGRlc3Ryb3k6ID0+XG4gICAgQHN0eWxlRGlzcG9zYWJsZXM/LmRpc3Bvc2UoKVxuICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcblxuICByZWZyZXNoOiA9PlxuICAgICMgSW50ZW50aW9uYWxseSBza2lwIGluIHNwZWMgbW9kZSwgc2luY2Ugbm90IGFsbCBzcGVjIGhhdmUgRE9NIGF0dGFjaGVkKCBhbmQgZG9uJ3Qgd2FudCB0byApLlxuICAgIHJldHVybiBpZiBhdG9tLmluU3BlY01vZGUoKVxuICAgIEBsaW5lSGVpZ2h0ID0gQGVkaXRvci5nZXRMaW5lSGVpZ2h0SW5QaXhlbHMoKVxuXG4gICAgIyBXZSBtdXN0IGRpc3Bvc2UgcHJldmlvdXMgc3R5bGUgbW9kaWZpY2F0aW9uIGZvciBub24tdmlzdWFsLW1vZGVcbiAgICBAc3R5bGVEaXNwb3NhYmxlcz8uZGlzcG9zZSgpXG4gICAgcmV0dXJuIHVubGVzcyBAbW9kZSBpcyAndmlzdWFsJ1xuXG4gICAgQHN0eWxlRGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIGlmIEBzdWJtb2RlIGlzICdibG9ja3dpc2UnXG4gICAgICBjdXJzb3JzVG9TaG93ID0gQHZpbVN0YXRlLmdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKS5tYXAgKGJzKSAtPiBicy5nZXRIZWFkU2VsZWN0aW9uKCkuY3Vyc29yXG4gICAgZWxzZVxuICAgICAgY3Vyc29yc1RvU2hvdyA9IEBlZGl0b3IuZ2V0Q3Vyc29ycygpXG5cbiAgICAjIEluIGJsb2Nrd2lzZSwgc2hvdyBvbmx5IGJsb2Nrd2lzZS1oZWFkIGN1cnNvclxuICAgIGZvciBjdXJzb3IgaW4gQGVkaXRvci5nZXRDdXJzb3JzKClcbiAgICAgIGN1cnNvci5zZXRWaXNpYmxlKGN1cnNvciBpbiBjdXJzb3JzVG9TaG93KVxuXG4gICAgIyBGSVhNRTogaW4gb2NjdXJyZW5jZSwgaW4gdkIsIG11bHRpLXNlbGVjdGlvbnMgYXJlIGFkZGVkIGR1cmluZyBvcGVyYXRpb24gYnV0IHNlbGVjdGlvbiBpcyBhZGRlZCBhc3luY2hyb25vdXNseS5cbiAgICAjIFdlIG5lZWQgdG8gbWFrZSBzdXJlIHRoYXQgY29ycmVzcG9uZGluZyBjdXJzb3IncyBkb21Ob2RlIGlzIGF2YWlsYWJsZSB0byBtb2RpZnkgaXQncyBzdHlsZS5cbiAgICBAZWRpdG9yRWxlbWVudC5jb21wb25lbnQudXBkYXRlU3luYygpXG5cbiAgICAjIFtOT1RFXSBVc2luZyBub24tcHVibGljIEFQSVxuICAgIGN1cnNvck5vZGVzQnlJZCA9IEBlZGl0b3JFbGVtZW50LmNvbXBvbmVudC5saW5lc0NvbXBvbmVudC5jdXJzb3JzQ29tcG9uZW50LmN1cnNvck5vZGVzQnlJZFxuICAgIGZvciBjdXJzb3IgaW4gY3Vyc29yc1RvU2hvdyB3aGVuIGN1cnNvck5vZGUgPSBjdXJzb3JOb2Rlc0J5SWRbY3Vyc29yLmlkXVxuICAgICAgQHN0eWxlRGlzcG9zYWJsZXMuYWRkIEBtb2RpZnlTdHlsZShjdXJzb3IsIGN1cnNvck5vZGUpXG5cbiAgZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25Ub0Rpc3BsYXk6IChzZWxlY3Rpb24pIC0+XG4gICAgYnVmZmVyUG9zaXRpb24gPSBzd3JhcChzZWxlY3Rpb24pLmdldEJ1ZmZlclBvc2l0aW9uRm9yKCdoZWFkJywgZnJvbTogWydwcm9wZXJ0eSddKVxuICAgIGlmIEBlZGl0b3IuaGFzQXRvbWljU29mdFRhYnMoKSBhbmQgbm90IHNlbGVjdGlvbi5pc1JldmVyc2VkKClcbiAgICAgIHNjcmVlblBvc2l0aW9uID0gQGVkaXRvci5zY3JlZW5Qb3NpdGlvbkZvckJ1ZmZlclBvc2l0aW9uKGJ1ZmZlclBvc2l0aW9uLnRyYW5zbGF0ZShbMCwgKzFdKSwgY2xpcERpcmVjdGlvbjogJ2ZvcndhcmQnKVxuICAgICAgYnVmZmVyUG9zaXRpb25Ub0Rpc3BsYXkgPSBAZWRpdG9yLmJ1ZmZlclBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oc2NyZWVuUG9zaXRpb24pLnRyYW5zbGF0ZShbMCwgLTFdKVxuICAgICAgaWYgYnVmZmVyUG9zaXRpb25Ub0Rpc3BsYXkuaXNHcmVhdGVyVGhhbihidWZmZXJQb3NpdGlvbilcbiAgICAgICAgYnVmZmVyUG9zaXRpb24gPSBidWZmZXJQb3NpdGlvblRvRGlzcGxheVxuXG4gICAgQGVkaXRvci5jbGlwQnVmZmVyUG9zaXRpb24oYnVmZmVyUG9zaXRpb24pXG5cbiAgIyBBcHBseSBzZWxlY3Rpb24gcHJvcGVydHkncyB0cmF2ZXJzYWwgZnJvbSBhY3R1YWwgY3Vyc29yIHRvIGN1cnNvck5vZGUncyBzdHlsZVxuICBtb2RpZnlTdHlsZTogKGN1cnNvciwgZG9tTm9kZSkgLT5cbiAgICBzZWxlY3Rpb24gPSBjdXJzb3Iuc2VsZWN0aW9uXG4gICAgYnVmZmVyUG9zaXRpb24gPSBAZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25Ub0Rpc3BsYXkoc2VsZWN0aW9uKVxuXG4gICAgaWYgQHN1Ym1vZGUgaXMgJ2xpbmV3aXNlJyBhbmQgQGVkaXRvci5pc1NvZnRXcmFwcGVkKClcbiAgICAgIHNjcmVlblBvc2l0aW9uID0gQGVkaXRvci5zY3JlZW5Qb3NpdGlvbkZvckJ1ZmZlclBvc2l0aW9uKGJ1ZmZlclBvc2l0aW9uKVxuICAgICAge3JvdywgY29sdW1ufSA9IHNjcmVlblBvc2l0aW9uLnRyYXZlcnNhbEZyb20oY3Vyc29yLmdldFNjcmVlblBvc2l0aW9uKCkpXG4gICAgZWxzZVxuICAgICAge3JvdywgY29sdW1ufSA9IGJ1ZmZlclBvc2l0aW9uLnRyYXZlcnNhbEZyb20oY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG5cbiAgICBzdHlsZSA9IGRvbU5vZGUuc3R5bGVcbiAgICBzdHlsZS5zZXRQcm9wZXJ0eSgndG9wJywgXCIje0BsaW5lSGVpZ2h0ICogcm93fXB4XCIpIGlmIHJvd1xuICAgIHN0eWxlLnNldFByb3BlcnR5KCdsZWZ0JywgXCIje2NvbHVtbn1jaFwiKSBpZiBjb2x1bW5cbiAgICBuZXcgRGlzcG9zYWJsZSAtPlxuICAgICAgc3R5bGUucmVtb3ZlUHJvcGVydHkoJ3RvcCcpXG4gICAgICBzdHlsZS5yZW1vdmVQcm9wZXJ0eSgnbGVmdCcpXG5cbm1vZHVsZS5leHBvcnRzID0gQ3Vyc29yU3R5bGVNYW5hZ2VyXG4iXX0=
