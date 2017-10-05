(function() {
  var CompositeDisposable, HighlightSearchManager, decorationOptions, matchScopes, ref, scanEditor,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require('./utils'), scanEditor = ref.scanEditor, matchScopes = ref.matchScopes;

  decorationOptions = {
    type: 'highlight',
    "class": 'vim-mode-plus-highlight-search'
  };

  module.exports = HighlightSearchManager = (function() {
    function HighlightSearchManager(vimState) {
      var ref1;
      this.vimState = vimState;
      this.destroy = bind(this.destroy, this);
      ref1 = this.vimState, this.editor = ref1.editor, this.editorElement = ref1.editorElement, this.globalState = ref1.globalState;
      this.disposables = new CompositeDisposable;
      this.markerLayer = this.editor.addMarkerLayer();
      this.disposables.add(this.vimState.onDidDestroy(this.destroy));
      this.decorationLayer = this.editor.decorateMarkerLayer(this.markerLayer, decorationOptions);
    }

    HighlightSearchManager.prototype.destroy = function() {
      this.decorationLayer.destroy();
      this.disposables.dispose();
      return this.markerLayer.destroy();
    };

    HighlightSearchManager.prototype.hasMarkers = function() {
      return this.markerLayer.getMarkerCount() > 0;
    };

    HighlightSearchManager.prototype.getMarkers = function() {
      return this.markerLayer.getMarkers();
    };

    HighlightSearchManager.prototype.clearMarkers = function() {
      return this.markerLayer.clear();
    };

    HighlightSearchManager.prototype.refresh = function() {
      var i, len, pattern, range, ref1, results;
      this.clearMarkers();
      if (!this.vimState.getConfig('highlightSearch')) {
        return;
      }
      if (!this.vimState.isVisible()) {
        return;
      }
      if (!(pattern = this.globalState.get('highlightSearchPattern'))) {
        return;
      }
      if (matchScopes(this.editorElement, this.vimState.getConfig('highlightSearchExcludeScopes'))) {
        return;
      }
      ref1 = scanEditor(this.editor, pattern);
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        range = ref1[i];
        results.push(this.markerLayer.markBufferRange(range, {
          invalidate: 'inside'
        }));
      }
      return results;
    };

    return HighlightSearchManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2FydHJlLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2hpZ2hsaWdodC1zZWFyY2gtbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDRGQUFBO0lBQUE7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN4QixNQUE0QixPQUFBLENBQVEsU0FBUixDQUE1QixFQUFDLDJCQUFELEVBQWE7O0VBRWIsaUJBQUEsR0FDRTtJQUFBLElBQUEsRUFBTSxXQUFOO0lBQ0EsQ0FBQSxLQUFBLENBQUEsRUFBTyxnQ0FEUDs7O0VBSUYsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNTLGdDQUFDLFFBQUQ7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFdBQUQ7O01BQ1osT0FBMEMsSUFBQyxDQUFBLFFBQTNDLEVBQUMsSUFBQyxDQUFBLGNBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxxQkFBQSxhQUFYLEVBQTBCLElBQUMsQ0FBQSxtQkFBQTtNQUMzQixJQUFDLENBQUEsV0FBRCxHQUFlLElBQUk7TUFDbkIsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFDLENBQUEsTUFBTSxDQUFDLGNBQVIsQ0FBQTtNQUVmLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVYsQ0FBdUIsSUFBQyxDQUFBLE9BQXhCLENBQWpCO01BQ0EsSUFBQyxDQUFBLGVBQUQsR0FBbUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxtQkFBUixDQUE0QixJQUFDLENBQUEsV0FBN0IsRUFBMEMsaUJBQTFDO0lBTlI7O3FDQVFiLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBQyxDQUFBLGVBQWUsQ0FBQyxPQUFqQixDQUFBO01BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLENBQUE7YUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsQ0FBQTtJQUhPOztxQ0FPVCxVQUFBLEdBQVksU0FBQTthQUNWLElBQUMsQ0FBQSxXQUFXLENBQUMsY0FBYixDQUFBLENBQUEsR0FBZ0M7SUFEdEI7O3FDQUdaLFVBQUEsR0FBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLFdBQVcsQ0FBQyxVQUFiLENBQUE7SUFEVTs7cUNBR1osWUFBQSxHQUFjLFNBQUE7YUFDWixJQUFDLENBQUEsV0FBVyxDQUFDLEtBQWIsQ0FBQTtJQURZOztxQ0FHZCxPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7TUFBQSxJQUFDLENBQUEsWUFBRCxDQUFBO01BRUEsSUFBQSxDQUFjLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBVixDQUFvQixpQkFBcEIsQ0FBZDtBQUFBLGVBQUE7O01BQ0EsSUFBQSxDQUFjLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBVixDQUFBLENBQWQ7QUFBQSxlQUFBOztNQUNBLElBQUEsQ0FBYyxDQUFBLE9BQUEsR0FBVSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsd0JBQWpCLENBQVYsQ0FBZDtBQUFBLGVBQUE7O01BQ0EsSUFBVSxXQUFBLENBQVksSUFBQyxDQUFBLGFBQWIsRUFBNEIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFWLENBQW9CLDhCQUFwQixDQUE1QixDQUFWO0FBQUEsZUFBQTs7QUFFQTtBQUFBO1dBQUEsc0NBQUE7O3FCQUNFLElBQUMsQ0FBQSxXQUFXLENBQUMsZUFBYixDQUE2QixLQUE3QixFQUFvQztVQUFBLFVBQUEsRUFBWSxRQUFaO1NBQXBDO0FBREY7O0lBUk87Ozs7O0FBbENYIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbntzY2FuRWRpdG9yLCBtYXRjaFNjb3Blc30gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5kZWNvcmF0aW9uT3B0aW9ucyA9XG4gIHR5cGU6ICdoaWdobGlnaHQnXG4gIGNsYXNzOiAndmltLW1vZGUtcGx1cy1oaWdobGlnaHQtc2VhcmNoJ1xuXG4jIEdlbmVyYWwgcHVycG9zZSB1dGlsaXR5IGNsYXNzIHRvIG1ha2UgQXRvbSdzIG1hcmtlciBtYW5hZ2VtZW50IGVhc2llci5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEhpZ2hsaWdodFNlYXJjaE1hbmFnZXJcbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3IsIEBlZGl0b3JFbGVtZW50LCBAZ2xvYmFsU3RhdGV9ID0gQHZpbVN0YXRlXG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAbWFya2VyTGF5ZXIgPSBAZWRpdG9yLmFkZE1hcmtlckxheWVyKClcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgQHZpbVN0YXRlLm9uRGlkRGVzdHJveShAZGVzdHJveSlcbiAgICBAZGVjb3JhdGlvbkxheWVyID0gQGVkaXRvci5kZWNvcmF0ZU1hcmtlckxheWVyKEBtYXJrZXJMYXllciwgZGVjb3JhdGlvbk9wdGlvbnMpXG5cbiAgZGVzdHJveTogPT5cbiAgICBAZGVjb3JhdGlvbkxheWVyLmRlc3Ryb3koKVxuICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICBAbWFya2VyTGF5ZXIuZGVzdHJveSgpXG5cbiAgIyBNYXJrZXJzXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBoYXNNYXJrZXJzOiAtPlxuICAgIEBtYXJrZXJMYXllci5nZXRNYXJrZXJDb3VudCgpID4gMFxuXG4gIGdldE1hcmtlcnM6IC0+XG4gICAgQG1hcmtlckxheWVyLmdldE1hcmtlcnMoKVxuXG4gIGNsZWFyTWFya2VyczogLT5cbiAgICBAbWFya2VyTGF5ZXIuY2xlYXIoKVxuXG4gIHJlZnJlc2g6IC0+XG4gICAgQGNsZWFyTWFya2VycygpXG5cbiAgICByZXR1cm4gdW5sZXNzIEB2aW1TdGF0ZS5nZXRDb25maWcoJ2hpZ2hsaWdodFNlYXJjaCcpXG4gICAgcmV0dXJuIHVubGVzcyBAdmltU3RhdGUuaXNWaXNpYmxlKClcbiAgICByZXR1cm4gdW5sZXNzIHBhdHRlcm4gPSBAZ2xvYmFsU3RhdGUuZ2V0KCdoaWdobGlnaHRTZWFyY2hQYXR0ZXJuJylcbiAgICByZXR1cm4gaWYgbWF0Y2hTY29wZXMoQGVkaXRvckVsZW1lbnQsIEB2aW1TdGF0ZS5nZXRDb25maWcoJ2hpZ2hsaWdodFNlYXJjaEV4Y2x1ZGVTY29wZXMnKSlcblxuICAgIGZvciByYW5nZSBpbiBzY2FuRWRpdG9yKEBlZGl0b3IsIHBhdHRlcm4pXG4gICAgICBAbWFya2VyTGF5ZXIubWFya0J1ZmZlclJhbmdlKHJhbmdlLCBpbnZhbGlkYXRlOiAnaW5zaWRlJylcbiJdfQ==
