(function() {
  var CompositeDisposable, LineNumberView,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = LineNumberView = (function() {
    function LineNumberView(editor) {
      this.editor = editor;
      this._undo = bind(this._undo, this);
      this._updateAbsoluteNumbers = bind(this._updateAbsoluteNumbers, this);
      this._updateSync = bind(this._updateSync, this);
      this._update = bind(this._update, this);
      this.subscriptions = new CompositeDisposable();
      this.editorView = atom.views.getView(this.editor);
      this.trueNumberCurrentLine = atom.config.get('relative-numbers.trueNumberCurrentLine');
      this.showAbsoluteNumbers = atom.config.get('relative-numbers.showAbsoluteNumbers');
      this.startAtOne = atom.config.get('relative-numbers.startAtOne');
      this.softWrapsCount = atom.config.get('relative-numbers.softWrapsCount');
      this.lineNumberGutterView = atom.views.getView(this.editor.gutterWithName('line-number'));
      this.gutter = this.editor.addGutter({
        name: 'relative-numbers'
      });
      this.gutter.view = this;
      try {
        this.subscriptions.add(this.editorView.model.onDidChange(this._update));
      } catch (error) {
        this.subscriptions.add(this.editorView.onDidAttach(this._update));
        this.subscriptions.add(this.editor.onDidStopChanging(this._update));
      }
      this.subscriptions.add(this.editor.onDidChangeCursorPosition(this._update));
      this.subscriptions.add(this.editorView.onDidChangeScrollTop(this._update));
      this.subscriptions.add(atom.config.onDidChange('relative-numbers.trueNumberCurrentLine', (function(_this) {
        return function() {
          _this.trueNumberCurrentLine = atom.config.get('relative-numbers.trueNumberCurrentLine');
          return _this._update();
        };
      })(this)));
      this.subscriptions.add(atom.config.onDidChange('relative-numbers.showAbsoluteNumbers', (function(_this) {
        return function() {
          _this.showAbsoluteNumbers = atom.config.get('relative-numbers.showAbsoluteNumbers');
          return _this._updateAbsoluteNumbers();
        };
      })(this)));
      this.subscriptions.add(atom.config.onDidChange('relative-numbers.startAtOne', (function(_this) {
        return function() {
          _this.startAtOne = atom.config.get('relative-numbers.startAtOne');
          return _this._update();
        };
      })(this)));
      this.subscriptions.add(atom.config.onDidChange('relative-numbers.softWrapsCount', (function(_this) {
        return function() {
          _this.softWrapsCount = atom.config.get('relative-numbers.softWrapsCount');
          return _this._update();
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidDestroy((function(_this) {
        return function() {
          return _this.subscriptions.dispose();
        };
      })(this)));
      this._update();
      this._updateAbsoluteNumbers();
    }

    LineNumberView.prototype.destroy = function() {
      this.subscriptions.dispose();
      this._undo();
      return this.gutter.destroy();
    };

    LineNumberView.prototype._spacer = function(totalLines, currentIndex) {
      var width;
      width = Math.max(0, totalLines.toString().length - currentIndex.toString().length);
      return Array(width + 1).join('&nbsp;');
    };

    LineNumberView.prototype._toggleAbsoluteClass = function(isActive) {
      var classNames;
      if (isActive == null) {
        isActive = false;
      }
      classNames = this.lineNumberGutterView.className.split(' ');
      if (isActive) {
        classNames.push('show-absolute');
        return this.lineNumberGutterView.className = classNames.join(' ');
      } else {
        classNames = classNames.filter(function(name) {
          return name !== 'show-absolute';
        });
        return this.lineNumberGutterView.className = classNames.join(' ');
      }
    };

    LineNumberView.prototype._update = function() {
      if (this.editorView.isUpdatedSynchronously()) {
        return this._updateSync();
      } else {
        return atom.views.updateDocument((function(_this) {
          return function() {
            return _this._updateSync();
          };
        })(this));
      }
    };

    LineNumberView.prototype._updateSync = function() {
      var absolute, absoluteText, counting_attribute, currentLineNumber, endOfLineSelected, i, len, lineNumberElement, lineNumberElements, offset, ref, relative, relativeClass, relativeText, results, row, totalLines;
      if (this.editor.isDestroyed()) {
        return;
      }
      totalLines = this.editor.getLineCount();
      currentLineNumber = this.softWrapsCount ? this.editor.getCursorScreenPosition().row : this.editor.getCursorBufferPosition().row;
      if (this.editor.getSelectedText().match(/\n$/)) {
        endOfLineSelected = true;
      } else {
        currentLineNumber = currentLineNumber + 1;
      }
      lineNumberElements = (ref = this.editorView.rootElement) != null ? ref.querySelectorAll('.line-number') : void 0;
      offset = this.startAtOne ? 1 : 0;
      counting_attribute = this.softWrapsCount ? 'data-screen-row' : 'data-buffer-row';
      results = [];
      for (i = 0, len = lineNumberElements.length; i < len; i++) {
        lineNumberElement = lineNumberElements[i];
        row = Number(lineNumberElement.getAttribute(counting_attribute)) || 0;
        absolute = row + 1;
        relative = Math.abs(currentLineNumber - absolute);
        relativeClass = 'relative';
        if (this.trueNumberCurrentLine && relative === 0) {
          if (endOfLineSelected) {
            relative = Number(this.editor.getCursorBufferPosition().row);
          } else {
            relative = Number(this.editor.getCursorBufferPosition().row) + 1;
          }
          relativeClass += ' current-line';
        } else {
          relative += offset;
        }
        absoluteText = this._spacer(totalLines, absolute) + absolute;
        relativeText = this._spacer(totalLines, relative) + relative;
        if (lineNumberElement.innerHTML.indexOf('•') === -1) {
          results.push(lineNumberElement.innerHTML = "<span class=\"absolute\">" + absoluteText + "</span><span class=\"" + relativeClass + "\">" + relativeText + "</span><div class=\"icon-right\"></div>");
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    LineNumberView.prototype._updateAbsoluteNumbers = function() {
      var className;
      className = this.lineNumberGutterView.className;
      if (!className.includes('show-absolute') && this.showAbsoluteNumbers) {
        return this._toggleAbsoluteClass(true);
      } else if (className.includes('show-absolute') && !this.showAbsoluteNumbers) {
        return this._toggleAbsoluteClass(false);
      }
    };

    LineNumberView.prototype._undo = function() {
      var absolute, absoluteText, i, len, lineNumberElement, lineNumberElements, ref, row, totalLines;
      totalLines = this.editor.getLineCount();
      lineNumberElements = (ref = this.editorView.rootElement) != null ? ref.querySelectorAll('.line-number') : void 0;
      for (i = 0, len = lineNumberElements.length; i < len; i++) {
        lineNumberElement = lineNumberElements[i];
        row = Number(lineNumberElement.getAttribute('data-buffer-row'));
        absolute = row + 1;
        absoluteText = this._spacer(totalLines, absolute) + absolute;
        if (lineNumberElement.innerHTML.indexOf('•') === -1) {
          lineNumberElement.innerHTML = absoluteText + "<div class=\"icon-right\"></div>";
        }
      }
      if (this.lineNumberGutterView.className.includes('show-absolute')) {
        return this._toggleAbsoluteClass(false);
      }
    };

    return LineNumberView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2FydHJlLy5hdG9tL3BhY2thZ2VzL3JlbGF0aXZlLW51bWJlcnMvbGliL2xpbmUtbnVtYmVyLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxtQ0FBQTtJQUFBOztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFFeEIsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNTLHdCQUFDLE1BQUQ7TUFBQyxJQUFDLENBQUEsU0FBRDs7Ozs7TUFDWixJQUFDLENBQUEsYUFBRCxHQUFxQixJQUFBLG1CQUFBLENBQUE7TUFDckIsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsSUFBQyxDQUFBLE1BQXBCO01BQ2QsSUFBQyxDQUFBLHFCQUFELEdBQXlCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix3Q0FBaEI7TUFDekIsSUFBQyxDQUFBLG1CQUFELEdBQXVCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixzQ0FBaEI7TUFDdkIsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNkJBQWhCO01BQ2QsSUFBQyxDQUFBLGNBQUQsR0FBa0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGlDQUFoQjtNQUVsQixJQUFDLENBQUEsb0JBQUQsR0FBd0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUF1QixhQUF2QixDQUFuQjtNQUV4QixJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBUixDQUNSO1FBQUEsSUFBQSxFQUFNLGtCQUFOO09BRFE7TUFFVixJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsR0FBZTtBQUVmO1FBRUUsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENB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bEIsQ0FBK0IsaUJBQS9CLENBQVA7UUFDTixRQUFBLEdBQVcsR0FBQSxHQUFNO1FBQ2pCLFlBQUEsR0FBZSxJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQsRUFBcUIsUUFBckIsQ0FBQSxHQUFpQztRQUNoRCxJQUFHLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxPQUE1QixDQUFvQyxHQUFwQyxDQUFBLEtBQTRDLENBQUMsQ0FBaEQ7VUFDRSxpQkFBaUIsQ0FBQyxTQUFsQixHQUFpQyxZQUFELEdBQWMsbUNBRGhEOztBQUpGO01BUUEsSUFBRyxJQUFDLENBQUEsb0JBQW9CLENBQUMsU0FBUyxDQUFDLFFBQWhDLENBQXlDLGVBQXpDLENBQUg7ZUFDRSxJQUFDLENBQUEsb0JBQUQsQ0FBc0IsS0FBdEIsRUFERjs7SUFYSzs7Ozs7QUFuSlQiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBMaW5lTnVtYmVyVmlld1xuICBjb25zdHJ1Y3RvcjogKEBlZGl0b3IpIC0+XG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgQGVkaXRvclZpZXcgPSBhdG9tLnZpZXdzLmdldFZpZXcoQGVkaXRvcilcbiAgICBAdHJ1ZU51bWJlckN1cnJlbnRMaW5lID0gYXRvbS5jb25maWcuZ2V0KCdyZWxhdGl2ZS1udW1iZXJzLnRydWVOdW1iZXJDdXJyZW50TGluZScpXG4gICAgQHNob3dBYnNvbHV0ZU51bWJlcnMgPSBhdG9tLmNvbmZpZy5nZXQoJ3JlbGF0aXZlLW51bWJlcnMuc2hvd0Fic29sdXRlTnVtYmVycycpXG4gICAgQHN0YXJ0QXRPbmUgPSBhdG9tLmNvbmZpZy5nZXQoJ3JlbGF0aXZlLW51bWJlcnMuc3RhcnRBdE9uZScpXG4gICAgQHNvZnRXcmFwc0NvdW50ID0gYXRvbS5jb25maWcuZ2V0KCdyZWxhdGl2ZS1udW1iZXJzLnNvZnRXcmFwc0NvdW50JylcblxuICAgIEBsaW5lTnVtYmVyR3V0dGVyVmlldyA9IGF0b20udmlld3MuZ2V0VmlldyhAZWRpdG9yLmd1dHRlcldpdGhOYW1lKCdsaW5lLW51bWJlcicpKVxuXG4gICAgQGd1dHRlciA9IEBlZGl0b3IuYWRkR3V0dGVyXG4gICAgICBuYW1lOiAncmVsYXRpdmUtbnVtYmVycydcbiAgICBAZ3V0dGVyLnZpZXcgPSB0aGlzXG5cbiAgICB0cnlcbiAgICAgICMgUHJlZmVycmVkOiBTdWJzY3JpYmUgdG8gYW55IGVkaXRvciBtb2RlbCBjaGFuZ2VzXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvclZpZXcubW9kZWwub25EaWRDaGFuZ2UoQF91cGRhdGUpXG4gICAgY2F0Y2hcbiAgICAgICMgRmFsbGJhY2s6IFN1YnNjcmliZSB0byBpbml0aWFsaXphdGlvbiBhbmQgZWRpdG9yIGNoYW5nZXNcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yVmlldy5vbkRpZEF0dGFjaChAX3VwZGF0ZSlcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLm9uRGlkU3RvcENoYW5naW5nKEBfdXBkYXRlKVxuXG4gICAgIyBTdWJzY3JpYmUgZm9yIHdoZW4gdGhlIGN1cnNvciBwb3NpdGlvbiBjaGFuZ2VzXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3Iub25EaWRDaGFuZ2VDdXJzb3JQb3NpdGlvbihAX3VwZGF0ZSlcblxuICAgICMgVXBkYXRlIHdoZW4gc2Nyb2xsaW5nXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3JWaWV3Lm9uRGlkQ2hhbmdlU2Nyb2xsVG9wKEBfdXBkYXRlKVxuXG4gICAgIyBTdWJzY3JpYmUgdG8gd2hlbiB0aGUgdHJ1ZSBudW1iZXIgb24gY3VycmVudCBsaW5lIGNvbmZpZyBpcyBtb2RpZmllZC5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ3JlbGF0aXZlLW51bWJlcnMudHJ1ZU51bWJlckN1cnJlbnRMaW5lJywgPT5cbiAgICAgIEB0cnVlTnVtYmVyQ3VycmVudExpbmUgPSBhdG9tLmNvbmZpZy5nZXQoJ3JlbGF0aXZlLW51bWJlcnMudHJ1ZU51bWJlckN1cnJlbnRMaW5lJylcbiAgICAgIEBfdXBkYXRlKClcblxuICAgICMgU3Vic2NyaWJlIHRvIHdoZW4gdGhlIHNob3cgYWJzb2x1dGUgbnVtYmVycyBzZXR0aW5nIGhhcyBjaGFuZ2VkXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdyZWxhdGl2ZS1udW1iZXJzLnNob3dBYnNvbHV0ZU51bWJlcnMnLCA9PlxuICAgICAgQHNob3dBYnNvbHV0ZU51bWJlcnMgPSBhdG9tLmNvbmZpZy5nZXQoJ3JlbGF0aXZlLW51bWJlcnMuc2hvd0Fic29sdXRlTnVtYmVycycpXG4gICAgICBAX3VwZGF0ZUFic29sdXRlTnVtYmVycygpXG5cbiAgICAjIFN1YnNjcmliZSB0byB3aGVuIHRoZSBzdGFydCBhdCBvbmUgY29uZmlnIG9wdGlvbiBpcyBtb2RpZmllZFxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAncmVsYXRpdmUtbnVtYmVycy5zdGFydEF0T25lJywgPT5cbiAgICAgIEBzdGFydEF0T25lID0gYXRvbS5jb25maWcuZ2V0KCdyZWxhdGl2ZS1udW1iZXJzLnN0YXJ0QXRPbmUnKVxuICAgICAgQF91cGRhdGUoKVxuXG4gICAgIyBTdWJzY3JpYmUgdG8gd2hlbiB0aGUgc3RhcnQgYXQgb25lIGNvbmZpZyBvcHRpb24gaXMgbW9kaWZpZWRcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ3JlbGF0aXZlLW51bWJlcnMuc29mdFdyYXBzQ291bnQnLCA9PlxuICAgICAgQHNvZnRXcmFwc0NvdW50ID0gYXRvbS5jb25maWcuZ2V0KCdyZWxhdGl2ZS1udW1iZXJzLnNvZnRXcmFwc0NvdW50JylcbiAgICAgIEBfdXBkYXRlKClcblxuXG4gICAgIyBEaXNwb3NlIHRoZSBzdWJzY3JpcHRpb25zIHdoZW4gdGhlIGVkaXRvciBpcyBkZXN0cm95ZWQuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3Iub25EaWREZXN0cm95ID0+XG4gICAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcblxuICAgIEBfdXBkYXRlKClcbiAgICBAX3VwZGF0ZUFic29sdXRlTnVtYmVycygpXG5cbiAgZGVzdHJveTogKCkgLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBAX3VuZG8oKVxuICAgIEBndXR0ZXIuZGVzdHJveSgpXG5cbiAgX3NwYWNlcjogKHRvdGFsTGluZXMsIGN1cnJlbnRJbmRleCkgLT5cbiAgICB3aWR0aCA9IE1hdGgubWF4KDAsIHRvdGFsTGluZXMudG9TdHJpbmcoKS5sZW5ndGggLSBjdXJyZW50SW5kZXgudG9TdHJpbmcoKS5sZW5ndGgpXG4gICAgQXJyYXkod2lkdGggKyAxKS5qb2luICcmbmJzcDsnXG5cbiAgIyBUb2dnbGUgdGhlIHNob3ctYWJzb2x1dGUgY2xhc3MgZnJvbSB0aGUgbGluZSBudW1iZXIgZ3V0dGVyIHZpZXdcbiAgX3RvZ2dsZUFic29sdXRlQ2xhc3M6IChpc0FjdGl2ZT1mYWxzZSkgLT5cbiAgICBjbGFzc05hbWVzID0gQGxpbmVOdW1iZXJHdXR0ZXJWaWV3LmNsYXNzTmFtZS5zcGxpdCgnICcpXG5cbiAgICAjIEFkZCB0aGUgc2hvdy1hYnNvbHV0ZSBjbGFzcyBpZiB0aGUgc2V0dGluZyBpcyBhY3RpdmUgYW5kIHRoZSBjbGFzc1xuICAgICMgd2FzIG5vdCBwcmV2aW91c2x5IGFkZGVkXG4gICAgaWYgaXNBY3RpdmVcbiAgICAgIGNsYXNzTmFtZXMucHVzaCgnc2hvdy1hYnNvbHV0ZScpXG4gICAgICBAbGluZU51bWJlckd1dHRlclZpZXcuY2xhc3NOYW1lID0gY2xhc3NOYW1lcy5qb2luKCcgJylcbiAgICAjIFJlbW92ZSB0aGUgc2hvdy1hYnNvbHV0ZSBjbGFzcyBpZiB0aGUgc2V0dGluZ3MgaXMgbm90IGFjdGl2ZSBhbmQgaXMgaW5cbiAgICAjIHRoZSBsaXN0IG9mIGFjdGl2ZSBjbGFzc05hbWVzIG9uIHRoZSB2aWV3LlxuICAgIGVsc2VcbiAgICAgIGNsYXNzTmFtZXMgPSBjbGFzc05hbWVzLmZpbHRlcigobmFtZSkgLT4gbmFtZSAhPSAnc2hvdy1hYnNvbHV0ZScpXG4gICAgICBAbGluZU51bWJlckd1dHRlclZpZXcuY2xhc3NOYW1lID0gY2xhc3NOYW1lcy5qb2luKCcgJylcblxuICAjIFVwZGF0ZSB0aGUgbGluZSBudW1iZXJzIG9uIHRoZSBlZGl0b3JcbiAgX3VwZGF0ZTogKCkgPT5cbiAgICAjIElmIHRoZSBndXR0ZXIgaXMgdXBkYXRlZCBhc3luY2hyb25vdXNseSwgd2UgbmVlZCB0byBkbyB0aGUgc2FtZSB0aGluZ1xuICAgICMgb3RoZXJ3aXNlIG91ciBjaGFuZ2VzIHdpbGwganVzdCBnZXQgcmV2ZXJ0ZWQgYmFjay5cbiAgICBpZiBAZWRpdG9yVmlldy5pc1VwZGF0ZWRTeW5jaHJvbm91c2x5KClcbiAgICAgIEBfdXBkYXRlU3luYygpXG4gICAgZWxzZVxuICAgICAgYXRvbS52aWV3cy51cGRhdGVEb2N1bWVudCAoKSA9PiBAX3VwZGF0ZVN5bmMoKVxuXG4gIF91cGRhdGVTeW5jOiAoKSA9PlxuICAgIGlmIEBlZGl0b3IuaXNEZXN0cm95ZWQoKVxuICAgICAgcmV0dXJuXG5cbiAgICB0b3RhbExpbmVzID0gQGVkaXRvci5nZXRMaW5lQ291bnQoKVxuICAgIGN1cnJlbnRMaW5lTnVtYmVyID0gaWYgQHNvZnRXcmFwc0NvdW50IHRoZW4gQGVkaXRvci5nZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbigpLnJvdyBlbHNlIEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKS5yb3dcblxuICAgICMgQ2hlY2sgaWYgc2VsZWN0aW9uIGVuZHMgd2l0aCBuZXdsaW5lXG4gICAgIyAoVGhlIHNlbGVjdGlvbiBlbmRzIHdpdGggbmV3IGxpbmUgYmVjYXVzZSBvZiB0aGUgcGFja2FnZSB2aW0tbW9kZSB3aGVuXG4gICAgIyBjdHJsK3YgaXMgcHJlc3NlZCBpbiB2aXN1YWwgbW9kZSlcbiAgICBpZiBAZWRpdG9yLmdldFNlbGVjdGVkVGV4dCgpLm1hdGNoKC9cXG4kLylcbiAgICAgIGVuZE9mTGluZVNlbGVjdGVkID0gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGN1cnJlbnRMaW5lTnVtYmVyID0gY3VycmVudExpbmVOdW1iZXIgKyAxXG5cbiAgICBsaW5lTnVtYmVyRWxlbWVudHMgPSBAZWRpdG9yVmlldy5yb290RWxlbWVudD8ucXVlcnlTZWxlY3RvckFsbCgnLmxpbmUtbnVtYmVyJylcbiAgICBvZmZzZXQgPSBpZiBAc3RhcnRBdE9uZSB0aGVuIDEgZWxzZSAwXG4gICAgY291bnRpbmdfYXR0cmlidXRlID0gaWYgQHNvZnRXcmFwc0NvdW50IHRoZW4gJ2RhdGEtc2NyZWVuLXJvdycgZWxzZSAnZGF0YS1idWZmZXItcm93J1xuXG4gICAgZm9yIGxpbmVOdW1iZXJFbGVtZW50IGluIGxpbmVOdW1iZXJFbGVtZW50c1xuICAgICAgIyBcInx8IDBcIiBpcyB1c2VkIGdpdmVuIGRhdGEtc2NyZWVuLXJvdyBpcyB1bmRlZmluZWQgZm9yIHRoZSBmaXJzdCByb3dcbiAgICAgIHJvdyA9IE51bWJlcihsaW5lTnVtYmVyRWxlbWVudC5nZXRBdHRyaWJ1dGUoY291bnRpbmdfYXR0cmlidXRlKSkgfHwgMFxuXG4gICAgICBhYnNvbHV0ZSA9IHJvdyArIDFcblxuICAgICAgcmVsYXRpdmUgPSBNYXRoLmFicyhjdXJyZW50TGluZU51bWJlciAtIGFic29sdXRlKVxuICAgICAgcmVsYXRpdmVDbGFzcyA9ICdyZWxhdGl2ZSdcblxuICAgICAgaWYgQHRydWVOdW1iZXJDdXJyZW50TGluZSBhbmQgcmVsYXRpdmUgPT0gMFxuICAgICAgICBpZiBlbmRPZkxpbmVTZWxlY3RlZFxuICAgICAgICAgIHJlbGF0aXZlID0gTnVtYmVyKEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKS5yb3cpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZWxhdGl2ZSA9IE51bWJlcihAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkucm93KSArIDFcblxuICAgICAgICByZWxhdGl2ZUNsYXNzICs9ICcgY3VycmVudC1saW5lJ1xuICAgICAgZWxzZVxuICAgICAgICAjIEFwcGx5IG9mZnNldCBsYXN0IHRoaW5nIGJlZm9yZSByZW5kZXJpbmdcbiAgICAgICAgcmVsYXRpdmUgKz0gb2Zmc2V0XG5cbiAgICAgIGFic29sdXRlVGV4dCA9IEBfc3BhY2VyKHRvdGFsTGluZXMsIGFic29sdXRlKSArIGFic29sdXRlXG4gICAgICByZWxhdGl2ZVRleHQgPSBAX3NwYWNlcih0b3RhbExpbmVzLCByZWxhdGl2ZSkgKyByZWxhdGl2ZVxuXG4gICAgICAjIEtlZXAgc29mdC13cmFwcGVkIGxpbmVzIGluZGljYXRvclxuICAgICAgaWYgbGluZU51bWJlckVsZW1lbnQuaW5uZXJIVE1MLmluZGV4T2YoJ+KAoicpID09IC0xXG4gICAgICAgIGxpbmVOdW1iZXJFbGVtZW50LmlubmVySFRNTCA9IFwiPHNwYW4gY2xhc3M9XFxcImFic29sdXRlXFxcIj4je2Fic29sdXRlVGV4dH08L3NwYW4+PHNwYW4gY2xhc3M9XFxcIiN7cmVsYXRpdmVDbGFzc31cXFwiPiN7cmVsYXRpdmVUZXh0fTwvc3Bhbj48ZGl2IGNsYXNzPVxcXCJpY29uLXJpZ2h0XFxcIj48L2Rpdj5cIlxuXG4gIF91cGRhdGVBYnNvbHV0ZU51bWJlcnM6ICgpID0+XG4gICAgY2xhc3NOYW1lID0gQGxpbmVOdW1iZXJHdXR0ZXJWaWV3LmNsYXNzTmFtZVxuICAgIGlmIG5vdCBjbGFzc05hbWUuaW5jbHVkZXMoJ3Nob3ctYWJzb2x1dGUnKSBhbmQgQHNob3dBYnNvbHV0ZU51bWJlcnNcbiAgICAgIEBfdG9nZ2xlQWJzb2x1dGVDbGFzcyh0cnVlKVxuICAgIGVsc2UgaWYgY2xhc3NOYW1lLmluY2x1ZGVzKCdzaG93LWFic29sdXRlJykgYW5kIG5vdCBAc2hvd0Fic29sdXRlTnVtYmVyc1xuICAgICAgQF90b2dnbGVBYnNvbHV0ZUNsYXNzKGZhbHNlKVxuXG4gICMgVW5kbyBjaGFuZ2VzIHRvIERPTVxuICBfdW5kbzogKCkgPT5cbiAgICB0b3RhbExpbmVzID0gQGVkaXRvci5nZXRMaW5lQ291bnQoKVxuICAgIGxpbmVOdW1iZXJFbGVtZW50cyA9IEBlZGl0b3JWaWV3LnJvb3RFbGVtZW50Py5xdWVyeVNlbGVjdG9yQWxsKCcubGluZS1udW1iZXInKVxuICAgIGZvciBsaW5lTnVtYmVyRWxlbWVudCBpbiBsaW5lTnVtYmVyRWxlbWVudHNcbiAgICAgIHJvdyA9IE51bWJlcihsaW5lTnVtYmVyRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtYnVmZmVyLXJvdycpKVxuICAgICAgYWJzb2x1dGUgPSByb3cgKyAxXG4gICAgICBhYnNvbHV0ZVRleHQgPSBAX3NwYWNlcih0b3RhbExpbmVzLCBhYnNvbHV0ZSkgKyBhYnNvbHV0ZVxuICAgICAgaWYgbGluZU51bWJlckVsZW1lbnQuaW5uZXJIVE1MLmluZGV4T2YoJ+KAoicpID09IC0xXG4gICAgICAgIGxpbmVOdW1iZXJFbGVtZW50LmlubmVySFRNTCA9IFwiI3thYnNvbHV0ZVRleHR9PGRpdiBjbGFzcz1cXFwiaWNvbi1yaWdodFxcXCI+PC9kaXY+XCJcblxuICAgICMgUmVtb3ZlIHNob3ctYWJzb2x1dGUgY2xhc3MgbmFtZSBpZiBwcmVzZW50XG4gICAgaWYgQGxpbmVOdW1iZXJHdXR0ZXJWaWV3LmNsYXNzTmFtZS5pbmNsdWRlcygnc2hvdy1hYnNvbHV0ZScpXG4gICAgICBAX3RvZ2dsZUFic29sdXRlQ2xhc3MoZmFsc2UpXG4iXX0=
