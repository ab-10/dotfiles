(function() {
  var CompositeDisposable, Emitter, SearchModel, addCurrentClassForDecoration, getIndex, getVisibleBufferRange, hoverCounterTimeoutID, ref, ref1, removeCurrentClassForDecoration, replaceDecorationClassBy, smartScrollToBufferPosition;

  ref = require('atom'), Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable;

  ref1 = require('./utils'), getVisibleBufferRange = ref1.getVisibleBufferRange, smartScrollToBufferPosition = ref1.smartScrollToBufferPosition, getIndex = ref1.getIndex, replaceDecorationClassBy = ref1.replaceDecorationClassBy;

  hoverCounterTimeoutID = null;

  removeCurrentClassForDecoration = null;

  addCurrentClassForDecoration = null;

  module.exports = SearchModel = (function() {
    SearchModel.prototype.relativeIndex = 0;

    SearchModel.prototype.lastRelativeIndex = null;

    SearchModel.prototype.onDidChangeCurrentMatch = function(fn) {
      return this.emitter.on('did-change-current-match', fn);
    };

    function SearchModel(vimState, options) {
      var ref2;
      this.vimState = vimState;
      this.options = options;
      this.emitter = new Emitter;
      ref2 = this.vimState, this.editor = ref2.editor, this.editorElement = ref2.editorElement;
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.editorElement.onDidChangeScrollTop(this.refreshMarkers.bind(this)));
      this.disposables.add(this.editorElement.onDidChangeScrollLeft(this.refreshMarkers.bind(this)));
      this.markerLayer = this.editor.addMarkerLayer();
      this.decoationByRange = {};
      this.onDidChangeCurrentMatch((function(_this) {
        return function() {
          var classList, point, text, timeout;
          _this.vimState.hoverSearchCounter.reset();
          if (_this.currentMatch == null) {
            if (_this.vimState.getConfig('flashScreenOnSearchHasNoMatch')) {
              _this.vimState.flash(getVisibleBufferRange(_this.editor), {
                type: 'screen'
              });
              atom.beep();
            }
            return;
          }
          if (_this.vimState.getConfig('showHoverSearchCounter')) {
            text = String(_this.currentMatchIndex + 1) + '/' + _this.matches.length;
            point = _this.currentMatch.start;
            classList = _this.classNamesForRange(_this.currentMatch);
            _this.resetHover();
            _this.vimState.hoverSearchCounter.set(text, point, {
              classList: classList
            });
            if (!_this.options.incrementalSearch) {
              timeout = _this.vimState.getConfig('showHoverSearchCounterDuration');
              hoverCounterTimeoutID = setTimeout(_this.resetHover.bind(_this), timeout);
            }
          }
          _this.editor.unfoldBufferRow(_this.currentMatch.start.row);
          smartScrollToBufferPosition(_this.editor, _this.currentMatch.start);
          if (_this.vimState.getConfig('flashOnSearch')) {
            return _this.vimState.flash(_this.currentMatch, {
              type: 'search'
            });
          }
        };
      })(this));
    }

    SearchModel.prototype.resetHover = function() {
      var ref2;
      if (hoverCounterTimeoutID != null) {
        clearTimeout(hoverCounterTimeoutID);
        hoverCounterTimeoutID = null;
      }
      return (ref2 = this.vimState.hoverSearchCounter) != null ? ref2.reset() : void 0;
    };

    SearchModel.prototype.destroy = function() {
      this.markerLayer.destroy();
      this.disposables.dispose();
      return this.decoationByRange = null;
    };

    SearchModel.prototype.clearMarkers = function() {
      this.markerLayer.clear();
      return this.decoationByRange = {};
    };

    SearchModel.prototype.classNamesForRange = function(range) {
      var classNames;
      classNames = [];
      if (range === this.firstMatch) {
        classNames.push('first');
      } else if (range === this.lastMatch) {
        classNames.push('last');
      }
      if (range === this.currentMatch) {
        classNames.push('current');
      }
      return classNames;
    };

    SearchModel.prototype.refreshMarkers = function() {
      var i, len, range, ref2, results;
      this.clearMarkers();
      ref2 = this.getVisibleMatchRanges();
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        range = ref2[i];
        results.push(this.decoationByRange[range.toString()] = this.decorateRange(range));
      }
      return results;
    };

    SearchModel.prototype.getVisibleMatchRanges = function() {
      var visibleMatchRanges, visibleRange;
      visibleRange = getVisibleBufferRange(this.editor);
      return visibleMatchRanges = this.matches.filter(function(range) {
        return range.intersectsWith(visibleRange);
      });
    };

    SearchModel.prototype.decorateRange = function(range) {
      var classNames, ref2;
      classNames = this.classNamesForRange(range);
      classNames = (ref2 = ['vim-mode-plus-search-match']).concat.apply(ref2, classNames);
      return this.editor.decorateMarker(this.markerLayer.markBufferRange(range), {
        type: 'highlight',
        "class": classNames.join(' ')
      });
    };

    SearchModel.prototype.search = function(fromPoint, pattern, relativeIndex) {
      var currentMatch, i, j, len, range, ref2, ref3, ref4;
      this.pattern = pattern;
      this.matches = [];
      this.editor.scan(this.pattern, (function(_this) {
        return function(arg) {
          var range;
          range = arg.range;
          return _this.matches.push(range);
        };
      })(this));
      ref2 = this.matches, this.firstMatch = ref2[0], this.lastMatch = ref2[ref2.length - 1];
      currentMatch = null;
      if (relativeIndex >= 0) {
        ref3 = this.matches;
        for (i = 0, len = ref3.length; i < len; i++) {
          range = ref3[i];
          if (!(range.start.isGreaterThan(fromPoint))) {
            continue;
          }
          currentMatch = range;
          break;
        }
        if (currentMatch == null) {
          currentMatch = this.firstMatch;
        }
        relativeIndex--;
      } else {
        ref4 = this.matches;
        for (j = ref4.length - 1; j >= 0; j += -1) {
          range = ref4[j];
          if (!(range.start.isLessThan(fromPoint))) {
            continue;
          }
          currentMatch = range;
          break;
        }
        if (currentMatch == null) {
          currentMatch = this.lastMatch;
        }
        relativeIndex++;
      }
      this.currentMatchIndex = this.matches.indexOf(currentMatch);
      this.updateCurrentMatch(relativeIndex);
      if (this.options.incrementalSearch) {
        this.refreshMarkers();
      }
      this.initialCurrentMatchIndex = this.currentMatchIndex;
      return this.currentMatch;
    };

    SearchModel.prototype.updateCurrentMatch = function(relativeIndex) {
      this.currentMatchIndex = getIndex(this.currentMatchIndex + relativeIndex, this.matches);
      this.currentMatch = this.matches[this.currentMatchIndex];
      return this.emitter.emit('did-change-current-match');
    };

    SearchModel.prototype.visit = function(relativeIndex) {
      var newDecoration, oldDecoration, ref2;
      if (relativeIndex == null) {
        relativeIndex = null;
      }
      if (relativeIndex != null) {
        this.lastRelativeIndex = relativeIndex;
      } else {
        relativeIndex = (ref2 = this.lastRelativeIndex) != null ? ref2 : +1;
      }
      if (!this.matches.length) {
        return;
      }
      oldDecoration = this.decoationByRange[this.currentMatch.toString()];
      this.updateCurrentMatch(relativeIndex);
      newDecoration = this.decoationByRange[this.currentMatch.toString()];
      if (removeCurrentClassForDecoration == null) {
        removeCurrentClassForDecoration = replaceDecorationClassBy.bind(null, function(text) {
          return text.replace(/\s+current(\s+)?$/, '$1');
        });
      }
      if (addCurrentClassForDecoration == null) {
        addCurrentClassForDecoration = replaceDecorationClassBy.bind(null, function(text) {
          return text.replace(/\s+current(\s+)?$/, '$1') + ' current';
        });
      }
      if (oldDecoration != null) {
        removeCurrentClassForDecoration(oldDecoration);
      }
      if (newDecoration != null) {
        return addCurrentClassForDecoration(newDecoration);
      }
    };

    SearchModel.prototype.getRelativeIndex = function() {
      return this.currentMatchIndex - this.initialCurrentMatchIndex;
    };

    return SearchModel;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2FydHJlLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3NlYXJjaC1tb2RlbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQWlDLE9BQUEsQ0FBUSxNQUFSLENBQWpDLEVBQUMscUJBQUQsRUFBVTs7RUFDVixPQUtJLE9BQUEsQ0FBUSxTQUFSLENBTEosRUFDRSxrREFERixFQUVFLDhEQUZGLEVBR0Usd0JBSEYsRUFJRTs7RUFHRixxQkFBQSxHQUF3Qjs7RUFDeEIsK0JBQUEsR0FBa0M7O0VBQ2xDLDRCQUFBLEdBQStCOztFQUUvQixNQUFNLENBQUMsT0FBUCxHQUNNOzBCQUNKLGFBQUEsR0FBZTs7MEJBQ2YsaUJBQUEsR0FBbUI7OzBCQUNuQix1QkFBQSxHQUF5QixTQUFDLEVBQUQ7YUFBUSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSwwQkFBWixFQUF3QyxFQUF4QztJQUFSOztJQUVaLHFCQUFDLFFBQUQsRUFBWSxPQUFaO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxXQUFEO01BQVcsSUFBQyxDQUFBLFVBQUQ7TUFDdkIsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJO01BRWYsT0FBNEIsSUFBQyxDQUFBLFFBQTdCLEVBQUMsSUFBQyxDQUFBLGNBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxxQkFBQTtNQUNYLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBSTtNQUNuQixJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxvQkFBZixDQUFvQyxJQUFDLENBQUEsY0FBYyxDQUFDLElBQWhCLENBQXFCLElBQXJCLENBQXBDLENBQWpCO01BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUMsQ0FBQSxhQUFhLENBQUMscUJBQWYsQ0FBcUMsSUFBQyxDQUFBLGNBQWMsQ0FBQyxJQUFoQixDQUFxQixJQUFyQixDQUFyQyxDQUFqQjtNQUNBLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQUE7TUFDZixJQUFDLENBQUEsZ0JBQUQsR0FBb0I7TUFFcEIsSUFBQyxDQUFBLHVCQUFELENBQXlCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQUN2QixjQUFBO1VBQUEsS0FBQyxDQUFBLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxLQUE3QixDQUFBO1VBQ0EsSUFBTywwQkFBUDtZQUNFLElBQUcsS0FBQyxDQUFBLFFBQVEsQ0FBQyxTQUFWLENBQW9CLCtCQUFwQixDQUFIO2NBQ0UsS0FBQyxDQUFBLFFBQVEsQ0FBQyxLQUFWLENBQWdCLHFCQUFBLENBQXNCLEtBQUMsQ0FBQSxNQUF2QixDQUFoQixFQUFnRDtnQkFBQSxJQUFBLEVBQU0sUUFBTjtlQUFoRDtjQUNBLElBQUksQ0FBQyxJQUFMLENBQUEsRUFGRjs7QUFHQSxtQkFKRjs7VUFNQSxJQUFHLEtBQUMsQ0FBQSxRQUFRLENBQUMsU0FBVixDQUFvQix3QkFBcEIsQ0FBSDtZQUNFLElBQUEsR0FBTyxNQUFBLENBQU8sS0FBQyxDQUFBLGlCQUFELEdBQXFCLENBQTVCLENBQUEsR0FBaUMsR0FBakMsR0FBdUMsS0FBQyxDQUFBLE9BQU8sQ0FBQztZQUN2RCxLQUFBLEdBQVEsS0FBQyxDQUFBLFlBQVksQ0FBQztZQUN0QixTQUFBLEdBQVksS0FBQyxDQUFBLGtCQUFELENBQW9CLEtBQUMsQ0FBQSxZQUFyQjtZQUVaLEtBQUMsQ0FBQSxVQUFELENBQUE7WUFDQSxLQUFDLENBQUEsUUFBUSxDQUFDLGtCQUFrQixDQUFDLEdBQTdCLENBQWlDLElBQWpDLEVBQXVDLEtBQXZDLEVBQThDO2NBQUMsV0FBQSxTQUFEO2FBQTlDO1lBRUEsSUFBQSxDQUFPLEtBQUMsQ0FBQSxPQUFPLENBQUMsaUJBQWhCO2NBQ0UsT0FBQSxHQUFVLEtBQUMsQ0FBQSxRQUFRLENBQUMsU0FBVixDQUFvQixnQ0FBcEI7Y0FDVixxQkFBQSxHQUF3QixVQUFBLENBQVcsS0FBQyxDQUFBLFVBQVUsQ0FBQyxJQUFaLENBQWlCLEtBQWpCLENBQVgsRUFBbUMsT0FBbkMsRUFGMUI7YUFSRjs7VUFZQSxLQUFDLENBQUEsTUFBTSxDQUFDLGVBQVIsQ0FBd0IsS0FBQyxDQUFBLFlBQVksQ0FBQyxLQUFLLENBQUMsR0FBNUM7VUFDQSwyQkFBQSxDQUE0QixLQUFDLENBQUEsTUFBN0IsRUFBcUMsS0FBQyxDQUFBLFlBQVksQ0FBQyxLQUFuRDtVQUVBLElBQUcsS0FBQyxDQUFBLFFBQVEsQ0FBQyxTQUFWLENBQW9CLGVBQXBCLENBQUg7bUJBQ0UsS0FBQyxDQUFBLFFBQVEsQ0FBQyxLQUFWLENBQWdCLEtBQUMsQ0FBQSxZQUFqQixFQUErQjtjQUFBLElBQUEsRUFBTSxRQUFOO2FBQS9CLEVBREY7O1FBdkJ1QjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekI7SUFWVzs7MEJBb0NiLFVBQUEsR0FBWSxTQUFBO0FBQ1YsVUFBQTtNQUFBLElBQUcsNkJBQUg7UUFDRSxZQUFBLENBQWEscUJBQWI7UUFDQSxxQkFBQSxHQUF3QixLQUYxQjs7cUVBTTRCLENBQUUsS0FBOUIsQ0FBQTtJQVBVOzswQkFTWixPQUFBLEdBQVMsU0FBQTtNQUNQLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFBO01BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLENBQUE7YUFDQSxJQUFDLENBQUEsZ0JBQUQsR0FBb0I7SUFIYjs7MEJBS1QsWUFBQSxHQUFjLFNBQUE7TUFDWixJQUFDLENBQUEsV0FBVyxDQUFDLEtBQWIsQ0FBQTthQUNBLElBQUMsQ0FBQSxnQkFBRCxHQUFvQjtJQUZSOzswQkFJZCxrQkFBQSxHQUFvQixTQUFDLEtBQUQ7QUFDbEIsVUFBQTtNQUFBLFVBQUEsR0FBYTtNQUNiLElBQUcsS0FBQSxLQUFTLElBQUMsQ0FBQSxVQUFiO1FBQ0UsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsT0FBaEIsRUFERjtPQUFBLE1BRUssSUFBRyxLQUFBLEtBQVMsSUFBQyxDQUFBLFNBQWI7UUFDSCxVQUFVLENBQUMsSUFBWCxDQUFnQixNQUFoQixFQURHOztNQUdMLElBQUcsS0FBQSxLQUFTLElBQUMsQ0FBQSxZQUFiO1FBQ0UsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsU0FBaEIsRUFERjs7YUFHQTtJQVZrQjs7MEJBWXBCLGNBQUEsR0FBZ0IsU0FBQTtBQUNkLFVBQUE7TUFBQSxJQUFDLENBQUEsWUFBRCxDQUFBO0FBQ0E7QUFBQTtXQUFBLHNDQUFBOztxQkFDRSxJQUFDLENBQUEsZ0JBQWlCLENBQUEsS0FBSyxDQUFDLFFBQU4sQ0FBQSxDQUFBLENBQWxCLEdBQXNDLElBQUMsQ0FBQSxhQUFELENBQWUsS0FBZjtBQUR4Qzs7SUFGYzs7MEJBS2hCLHFCQUFBLEdBQXVCLFNBQUE7QUFDckIsVUFBQTtNQUFBLFlBQUEsR0FBZSxxQkFBQSxDQUFzQixJQUFDLENBQUEsTUFBdkI7YUFDZixrQkFBQSxHQUFxQixJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBZ0IsU0FBQyxLQUFEO2VBQ25DLEtBQUssQ0FBQyxjQUFOLENBQXFCLFlBQXJCO01BRG1DLENBQWhCO0lBRkE7OzBCQUt2QixhQUFBLEdBQWUsU0FBQyxLQUFEO0FBQ2IsVUFBQTtNQUFBLFVBQUEsR0FBYSxJQUFDLENBQUEsa0JBQUQsQ0FBb0IsS0FBcEI7TUFDYixVQUFBLEdBQWEsUUFBQSxDQUFDLDRCQUFELENBQUEsQ0FBOEIsQ0FBQyxNQUEvQixhQUFzQyxVQUF0QzthQUNiLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUF1QixJQUFDLENBQUEsV0FBVyxDQUFDLGVBQWIsQ0FBNkIsS0FBN0IsQ0FBdkIsRUFDRTtRQUFBLElBQUEsRUFBTSxXQUFOO1FBQ0EsQ0FBQSxLQUFBLENBQUEsRUFBTyxVQUFVLENBQUMsSUFBWCxDQUFnQixHQUFoQixDQURQO09BREY7SUFIYTs7MEJBT2YsTUFBQSxHQUFRLFNBQUMsU0FBRCxFQUFZLE9BQVosRUFBc0IsYUFBdEI7QUFDTixVQUFBO01BRGtCLElBQUMsQ0FBQSxVQUFEO01BQ2xCLElBQUMsQ0FBQSxPQUFELEdBQVc7TUFDWCxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxJQUFDLENBQUEsT0FBZCxFQUF1QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsR0FBRDtBQUNyQixjQUFBO1VBRHVCLFFBQUQ7aUJBQ3RCLEtBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLEtBQWQ7UUFEcUI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZCO01BR0EsT0FBaUMsSUFBQyxDQUFBLE9BQWxDLEVBQUMsSUFBQyxDQUFBLG9CQUFGLEVBQW1CLElBQUMsQ0FBQTtNQUVwQixZQUFBLEdBQWU7TUFDZixJQUFHLGFBQUEsSUFBaUIsQ0FBcEI7QUFDRTtBQUFBLGFBQUEsc0NBQUE7O2dCQUEyQixLQUFLLENBQUMsS0FBSyxDQUFDLGFBQVosQ0FBMEIsU0FBMUI7OztVQUN6QixZQUFBLEdBQWU7QUFDZjtBQUZGOztVQUdBLGVBQWdCLElBQUMsQ0FBQTs7UUFDakIsYUFBQSxHQUxGO09BQUEsTUFBQTtBQU9FO0FBQUEsYUFBQSxvQ0FBQTs7Z0JBQWlDLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBWixDQUF1QixTQUF2Qjs7O1VBQy9CLFlBQUEsR0FBZTtBQUNmO0FBRkY7O1VBR0EsZUFBZ0IsSUFBQyxDQUFBOztRQUNqQixhQUFBLEdBWEY7O01BYUEsSUFBQyxDQUFBLGlCQUFELEdBQXFCLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FBVCxDQUFpQixZQUFqQjtNQUNyQixJQUFDLENBQUEsa0JBQUQsQ0FBb0IsYUFBcEI7TUFDQSxJQUFHLElBQUMsQ0FBQSxPQUFPLENBQUMsaUJBQVo7UUFDRSxJQUFDLENBQUEsY0FBRCxDQUFBLEVBREY7O01BRUEsSUFBQyxDQUFBLHdCQUFELEdBQTRCLElBQUMsQ0FBQTthQUM3QixJQUFDLENBQUE7SUExQks7OzBCQTRCUixrQkFBQSxHQUFvQixTQUFDLGFBQUQ7TUFDbEIsSUFBQyxDQUFBLGlCQUFELEdBQXFCLFFBQUEsQ0FBUyxJQUFDLENBQUEsaUJBQUQsR0FBcUIsYUFBOUIsRUFBNkMsSUFBQyxDQUFBLE9BQTlDO01BQ3JCLElBQUMsQ0FBQSxZQUFELEdBQWdCLElBQUMsQ0FBQSxPQUFRLENBQUEsSUFBQyxDQUFBLGlCQUFEO2FBQ3pCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLDBCQUFkO0lBSGtCOzswQkFLcEIsS0FBQSxHQUFPLFNBQUMsYUFBRDtBQUNMLFVBQUE7O1FBRE0sZ0JBQWM7O01BQ3BCLElBQUcscUJBQUg7UUFDRSxJQUFDLENBQUEsaUJBQUQsR0FBcUIsY0FEdkI7T0FBQSxNQUFBO1FBR0UsYUFBQSxvREFBcUMsQ0FBQyxFQUh4Qzs7TUFLQSxJQUFBLENBQWMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUF2QjtBQUFBLGVBQUE7O01BQ0EsYUFBQSxHQUFnQixJQUFDLENBQUEsZ0JBQWlCLENBQUEsSUFBQyxDQUFBLFlBQVksQ0FBQyxRQUFkLENBQUEsQ0FBQTtNQUNsQyxJQUFDLENBQUEsa0JBQUQsQ0FBb0IsYUFBcEI7TUFDQSxhQUFBLEdBQWdCLElBQUMsQ0FBQSxnQkFBaUIsQ0FBQSxJQUFDLENBQUEsWUFBWSxDQUFDLFFBQWQsQ0FBQSxDQUFBOztRQUVsQyxrQ0FBbUMsd0JBQXdCLENBQUMsSUFBekIsQ0FBOEIsSUFBOUIsRUFBcUMsU0FBQyxJQUFEO2lCQUN0RSxJQUFJLENBQUMsT0FBTCxDQUFhLG1CQUFiLEVBQWtDLElBQWxDO1FBRHNFLENBQXJDOzs7UUFHbkMsK0JBQWdDLHdCQUF3QixDQUFDLElBQXpCLENBQThCLElBQTlCLEVBQXFDLFNBQUMsSUFBRDtpQkFDbkUsSUFBSSxDQUFDLE9BQUwsQ0FBYSxtQkFBYixFQUFrQyxJQUFsQyxDQUFBLEdBQTBDO1FBRHlCLENBQXJDOztNQUdoQyxJQUFHLHFCQUFIO1FBQ0UsK0JBQUEsQ0FBZ0MsYUFBaEMsRUFERjs7TUFHQSxJQUFHLHFCQUFIO2VBQ0UsNEJBQUEsQ0FBNkIsYUFBN0IsRUFERjs7SUFwQks7OzBCQXVCUCxnQkFBQSxHQUFrQixTQUFBO2FBQ2hCLElBQUMsQ0FBQSxpQkFBRCxHQUFxQixJQUFDLENBQUE7SUFETjs7Ozs7QUE3SnBCIiwic291cmNlc0NvbnRlbnQiOlsie0VtaXR0ZXIsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbntcbiAgZ2V0VmlzaWJsZUJ1ZmZlclJhbmdlXG4gIHNtYXJ0U2Nyb2xsVG9CdWZmZXJQb3NpdGlvblxuICBnZXRJbmRleFxuICByZXBsYWNlRGVjb3JhdGlvbkNsYXNzQnlcbn0gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5ob3ZlckNvdW50ZXJUaW1lb3V0SUQgPSBudWxsXG5yZW1vdmVDdXJyZW50Q2xhc3NGb3JEZWNvcmF0aW9uID0gbnVsbFxuYWRkQ3VycmVudENsYXNzRm9yRGVjb3JhdGlvbiA9IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgU2VhcmNoTW9kZWxcbiAgcmVsYXRpdmVJbmRleDogMFxuICBsYXN0UmVsYXRpdmVJbmRleDogbnVsbFxuICBvbkRpZENoYW5nZUN1cnJlbnRNYXRjaDogKGZuKSAtPiBAZW1pdHRlci5vbiAnZGlkLWNoYW5nZS1jdXJyZW50LW1hdGNoJywgZm5cblxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSwgQG9wdGlvbnMpIC0+XG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuXG4gICAge0BlZGl0b3IsIEBlZGl0b3JFbGVtZW50fSA9IEB2aW1TdGF0ZVxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGRpc3Bvc2FibGVzLmFkZChAZWRpdG9yRWxlbWVudC5vbkRpZENoYW5nZVNjcm9sbFRvcChAcmVmcmVzaE1hcmtlcnMuYmluZCh0aGlzKSkpXG4gICAgQGRpc3Bvc2FibGVzLmFkZChAZWRpdG9yRWxlbWVudC5vbkRpZENoYW5nZVNjcm9sbExlZnQoQHJlZnJlc2hNYXJrZXJzLmJpbmQodGhpcykpKVxuICAgIEBtYXJrZXJMYXllciA9IEBlZGl0b3IuYWRkTWFya2VyTGF5ZXIoKVxuICAgIEBkZWNvYXRpb25CeVJhbmdlID0ge31cblxuICAgIEBvbkRpZENoYW5nZUN1cnJlbnRNYXRjaCA9PlxuICAgICAgQHZpbVN0YXRlLmhvdmVyU2VhcmNoQ291bnRlci5yZXNldCgpXG4gICAgICB1bmxlc3MgQGN1cnJlbnRNYXRjaD9cbiAgICAgICAgaWYgQHZpbVN0YXRlLmdldENvbmZpZygnZmxhc2hTY3JlZW5PblNlYXJjaEhhc05vTWF0Y2gnKVxuICAgICAgICAgIEB2aW1TdGF0ZS5mbGFzaChnZXRWaXNpYmxlQnVmZmVyUmFuZ2UoQGVkaXRvciksIHR5cGU6ICdzY3JlZW4nKVxuICAgICAgICAgIGF0b20uYmVlcCgpXG4gICAgICAgIHJldHVyblxuXG4gICAgICBpZiBAdmltU3RhdGUuZ2V0Q29uZmlnKCdzaG93SG92ZXJTZWFyY2hDb3VudGVyJylcbiAgICAgICAgdGV4dCA9IFN0cmluZyhAY3VycmVudE1hdGNoSW5kZXggKyAxKSArICcvJyArIEBtYXRjaGVzLmxlbmd0aFxuICAgICAgICBwb2ludCA9IEBjdXJyZW50TWF0Y2guc3RhcnRcbiAgICAgICAgY2xhc3NMaXN0ID0gQGNsYXNzTmFtZXNGb3JSYW5nZShAY3VycmVudE1hdGNoKVxuXG4gICAgICAgIEByZXNldEhvdmVyKClcbiAgICAgICAgQHZpbVN0YXRlLmhvdmVyU2VhcmNoQ291bnRlci5zZXQodGV4dCwgcG9pbnQsIHtjbGFzc0xpc3R9KVxuXG4gICAgICAgIHVubGVzcyBAb3B0aW9ucy5pbmNyZW1lbnRhbFNlYXJjaFxuICAgICAgICAgIHRpbWVvdXQgPSBAdmltU3RhdGUuZ2V0Q29uZmlnKCdzaG93SG92ZXJTZWFyY2hDb3VudGVyRHVyYXRpb24nKVxuICAgICAgICAgIGhvdmVyQ291bnRlclRpbWVvdXRJRCA9IHNldFRpbWVvdXQoQHJlc2V0SG92ZXIuYmluZCh0aGlzKSwgdGltZW91dClcblxuICAgICAgQGVkaXRvci51bmZvbGRCdWZmZXJSb3coQGN1cnJlbnRNYXRjaC5zdGFydC5yb3cpXG4gICAgICBzbWFydFNjcm9sbFRvQnVmZmVyUG9zaXRpb24oQGVkaXRvciwgQGN1cnJlbnRNYXRjaC5zdGFydClcblxuICAgICAgaWYgQHZpbVN0YXRlLmdldENvbmZpZygnZmxhc2hPblNlYXJjaCcpXG4gICAgICAgIEB2aW1TdGF0ZS5mbGFzaChAY3VycmVudE1hdGNoLCB0eXBlOiAnc2VhcmNoJylcblxuICByZXNldEhvdmVyOiAtPlxuICAgIGlmIGhvdmVyQ291bnRlclRpbWVvdXRJRD9cbiAgICAgIGNsZWFyVGltZW91dChob3ZlckNvdW50ZXJUaW1lb3V0SUQpXG4gICAgICBob3ZlckNvdW50ZXJUaW1lb3V0SUQgPSBudWxsXG4gICAgIyBTZWUgIzY3NFxuICAgICMgVGhpcyBtZXRob2QgY2FsbGVkIHdpdGggc2V0VGltZW91dFxuICAgICMgaG92ZXJTZWFyY2hDb3VudGVyIG1pZ2h0IG5vdCBiZSBhdmFpbGFibGUgd2hlbiBlZGl0b3IgZGVzdHJveWVkLlxuICAgIEB2aW1TdGF0ZS5ob3ZlclNlYXJjaENvdW50ZXI/LnJlc2V0KClcblxuICBkZXN0cm95OiAtPlxuICAgIEBtYXJrZXJMYXllci5kZXN0cm95KClcbiAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgQGRlY29hdGlvbkJ5UmFuZ2UgPSBudWxsXG5cbiAgY2xlYXJNYXJrZXJzOiAtPlxuICAgIEBtYXJrZXJMYXllci5jbGVhcigpXG4gICAgQGRlY29hdGlvbkJ5UmFuZ2UgPSB7fVxuXG4gIGNsYXNzTmFtZXNGb3JSYW5nZTogKHJhbmdlKSAtPlxuICAgIGNsYXNzTmFtZXMgPSBbXVxuICAgIGlmIHJhbmdlIGlzIEBmaXJzdE1hdGNoXG4gICAgICBjbGFzc05hbWVzLnB1c2goJ2ZpcnN0JylcbiAgICBlbHNlIGlmIHJhbmdlIGlzIEBsYXN0TWF0Y2hcbiAgICAgIGNsYXNzTmFtZXMucHVzaCgnbGFzdCcpXG5cbiAgICBpZiByYW5nZSBpcyBAY3VycmVudE1hdGNoXG4gICAgICBjbGFzc05hbWVzLnB1c2goJ2N1cnJlbnQnKVxuXG4gICAgY2xhc3NOYW1lc1xuXG4gIHJlZnJlc2hNYXJrZXJzOiAtPlxuICAgIEBjbGVhck1hcmtlcnMoKVxuICAgIGZvciByYW5nZSBpbiBAZ2V0VmlzaWJsZU1hdGNoUmFuZ2VzKClcbiAgICAgIEBkZWNvYXRpb25CeVJhbmdlW3JhbmdlLnRvU3RyaW5nKCldID0gQGRlY29yYXRlUmFuZ2UocmFuZ2UpXG5cbiAgZ2V0VmlzaWJsZU1hdGNoUmFuZ2VzOiAtPlxuICAgIHZpc2libGVSYW5nZSA9IGdldFZpc2libGVCdWZmZXJSYW5nZShAZWRpdG9yKVxuICAgIHZpc2libGVNYXRjaFJhbmdlcyA9IEBtYXRjaGVzLmZpbHRlciAocmFuZ2UpIC0+XG4gICAgICByYW5nZS5pbnRlcnNlY3RzV2l0aCh2aXNpYmxlUmFuZ2UpXG5cbiAgZGVjb3JhdGVSYW5nZTogKHJhbmdlKSAtPlxuICAgIGNsYXNzTmFtZXMgPSBAY2xhc3NOYW1lc0ZvclJhbmdlKHJhbmdlKVxuICAgIGNsYXNzTmFtZXMgPSBbJ3ZpbS1tb2RlLXBsdXMtc2VhcmNoLW1hdGNoJ10uY29uY2F0KGNsYXNzTmFtZXMuLi4pXG4gICAgQGVkaXRvci5kZWNvcmF0ZU1hcmtlciBAbWFya2VyTGF5ZXIubWFya0J1ZmZlclJhbmdlKHJhbmdlKSxcbiAgICAgIHR5cGU6ICdoaWdobGlnaHQnXG4gICAgICBjbGFzczogY2xhc3NOYW1lcy5qb2luKCcgJylcblxuICBzZWFyY2g6IChmcm9tUG9pbnQsIEBwYXR0ZXJuLCByZWxhdGl2ZUluZGV4KSAtPlxuICAgIEBtYXRjaGVzID0gW11cbiAgICBAZWRpdG9yLnNjYW4gQHBhdHRlcm4sICh7cmFuZ2V9KSA9PlxuICAgICAgQG1hdGNoZXMucHVzaChyYW5nZSlcblxuICAgIFtAZmlyc3RNYXRjaCwgLi4uLCBAbGFzdE1hdGNoXSA9IEBtYXRjaGVzXG5cbiAgICBjdXJyZW50TWF0Y2ggPSBudWxsXG4gICAgaWYgcmVsYXRpdmVJbmRleCA+PSAwXG4gICAgICBmb3IgcmFuZ2UgaW4gQG1hdGNoZXMgd2hlbiByYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuKGZyb21Qb2ludClcbiAgICAgICAgY3VycmVudE1hdGNoID0gcmFuZ2VcbiAgICAgICAgYnJlYWtcbiAgICAgIGN1cnJlbnRNYXRjaCA/PSBAZmlyc3RNYXRjaFxuICAgICAgcmVsYXRpdmVJbmRleC0tXG4gICAgZWxzZVxuICAgICAgZm9yIHJhbmdlIGluIEBtYXRjaGVzIGJ5IC0xIHdoZW4gcmFuZ2Uuc3RhcnQuaXNMZXNzVGhhbihmcm9tUG9pbnQpXG4gICAgICAgIGN1cnJlbnRNYXRjaCA9IHJhbmdlXG4gICAgICAgIGJyZWFrXG4gICAgICBjdXJyZW50TWF0Y2ggPz0gQGxhc3RNYXRjaFxuICAgICAgcmVsYXRpdmVJbmRleCsrXG5cbiAgICBAY3VycmVudE1hdGNoSW5kZXggPSBAbWF0Y2hlcy5pbmRleE9mKGN1cnJlbnRNYXRjaClcbiAgICBAdXBkYXRlQ3VycmVudE1hdGNoKHJlbGF0aXZlSW5kZXgpXG4gICAgaWYgQG9wdGlvbnMuaW5jcmVtZW50YWxTZWFyY2hcbiAgICAgIEByZWZyZXNoTWFya2VycygpXG4gICAgQGluaXRpYWxDdXJyZW50TWF0Y2hJbmRleCA9IEBjdXJyZW50TWF0Y2hJbmRleFxuICAgIEBjdXJyZW50TWF0Y2hcblxuICB1cGRhdGVDdXJyZW50TWF0Y2g6IChyZWxhdGl2ZUluZGV4KSAtPlxuICAgIEBjdXJyZW50TWF0Y2hJbmRleCA9IGdldEluZGV4KEBjdXJyZW50TWF0Y2hJbmRleCArIHJlbGF0aXZlSW5kZXgsIEBtYXRjaGVzKVxuICAgIEBjdXJyZW50TWF0Y2ggPSBAbWF0Y2hlc1tAY3VycmVudE1hdGNoSW5kZXhdXG4gICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1jdXJyZW50LW1hdGNoJylcblxuICB2aXNpdDogKHJlbGF0aXZlSW5kZXg9bnVsbCkgLT5cbiAgICBpZiByZWxhdGl2ZUluZGV4P1xuICAgICAgQGxhc3RSZWxhdGl2ZUluZGV4ID0gcmVsYXRpdmVJbmRleFxuICAgIGVsc2VcbiAgICAgIHJlbGF0aXZlSW5kZXggPSBAbGFzdFJlbGF0aXZlSW5kZXggPyArMVxuXG4gICAgcmV0dXJuIHVubGVzcyBAbWF0Y2hlcy5sZW5ndGhcbiAgICBvbGREZWNvcmF0aW9uID0gQGRlY29hdGlvbkJ5UmFuZ2VbQGN1cnJlbnRNYXRjaC50b1N0cmluZygpXVxuICAgIEB1cGRhdGVDdXJyZW50TWF0Y2gocmVsYXRpdmVJbmRleClcbiAgICBuZXdEZWNvcmF0aW9uID0gQGRlY29hdGlvbkJ5UmFuZ2VbQGN1cnJlbnRNYXRjaC50b1N0cmluZygpXVxuXG4gICAgcmVtb3ZlQ3VycmVudENsYXNzRm9yRGVjb3JhdGlvbiA/PSByZXBsYWNlRGVjb3JhdGlvbkNsYXNzQnkuYmluZCBudWxsICwgKHRleHQpIC0+XG4gICAgICB0ZXh0LnJlcGxhY2UoL1xccytjdXJyZW50KFxccyspPyQvLCAnJDEnKVxuXG4gICAgYWRkQ3VycmVudENsYXNzRm9yRGVjb3JhdGlvbiA/PSByZXBsYWNlRGVjb3JhdGlvbkNsYXNzQnkuYmluZCBudWxsICwgKHRleHQpIC0+XG4gICAgICB0ZXh0LnJlcGxhY2UoL1xccytjdXJyZW50KFxccyspPyQvLCAnJDEnKSArICcgY3VycmVudCdcblxuICAgIGlmIG9sZERlY29yYXRpb24/XG4gICAgICByZW1vdmVDdXJyZW50Q2xhc3NGb3JEZWNvcmF0aW9uKG9sZERlY29yYXRpb24pXG5cbiAgICBpZiBuZXdEZWNvcmF0aW9uP1xuICAgICAgYWRkQ3VycmVudENsYXNzRm9yRGVjb3JhdGlvbihuZXdEZWNvcmF0aW9uKVxuXG4gIGdldFJlbGF0aXZlSW5kZXg6IC0+XG4gICAgQGN1cnJlbnRNYXRjaEluZGV4IC0gQGluaXRpYWxDdXJyZW50TWF0Y2hJbmRleFxuIl19
