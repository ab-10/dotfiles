(function() {
  var TabControl,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  TabControl = (function() {
    function TabControl() {
      this.show = bind(this.show, this);
    }

    TabControl.prototype.config = {
      autoSaveChanges: {
        type: 'boolean',
        "default": false
      },
      displayInStatusBar: {
        type: 'boolean',
        "default": true
      }
    };

    TabControl.prototype.dialog = null;

    TabControl.prototype.status = null;

    TabControl.prototype.subs = null;

    TabControl.prototype.activate = function() {
      var CompositeDisposable, TabControlStatus;
      CompositeDisposable = require('atom').CompositeDisposable;
      TabControlStatus = require('./tab-control-status');
      this.subs = new CompositeDisposable;
      this.status = new TabControlStatus;
      this.subs.add(atom.commands.add('atom-workspace', 'tab-control:show', this.show));
      return this.subs.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var disposable;
          disposable = editor.onDidChangeGrammar(function() {
            var ref;
            return (ref = _this.status) != null ? ref.update() : void 0;
          });
          return editor.onDidDestroy(function() {
            return disposable.dispose();
          });
        };
      })(this)));
    };

    TabControl.prototype.deactivate = function() {
      var ref, ref1, ref2;
      if ((ref = this.subs) != null) {
        ref.dispose();
      }
      this.subs = null;
      if ((ref1 = this.dialog) != null) {
        ref1.destroy();
      }
      this.dialog = null;
      if ((ref2 = this.status) != null) {
        ref2.destroy();
      }
      return this.status = null;
    };

    TabControl.prototype.show = function() {
      var TabControlDialog;
      if (this.dialog == null) {
        TabControlDialog = require('./tab-control-dialog');
        this.dialog = new TabControlDialog(this.status);
      }
      return this.dialog.toggle();
    };

    TabControl.prototype.consumeStatusBar = function(statusBar) {
      return this.status.attach(statusBar);
    };

    return TabControl;

  })();

  module.exports = new TabControl;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2FydHJlLy5hdG9tL3BhY2thZ2VzL3RhYi1jb250cm9sL2xpYi90YWItY29udHJvbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7QUFBQSxNQUFBLFVBQUE7SUFBQTs7RUFBTTs7Ozs7eUJBQ0osTUFBQSxHQUNFO01BQUEsZUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7T0FERjtNQUdBLGtCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtPQUpGOzs7eUJBT0YsTUFBQSxHQUFROzt5QkFDUixNQUFBLEdBQVE7O3lCQUNSLElBQUEsR0FBTTs7eUJBR04sUUFBQSxHQUFVLFNBQUE7QUFFUixVQUFBO01BQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSO01BQ3hCLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxzQkFBUjtNQUNuQixJQUFDLENBQUEsSUFBRCxHQUFRLElBQUk7TUFDWixJQUFDLENBQUEsTUFBRCxHQUFVLElBQUk7TUFDZCxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBVSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DLGtCQUFwQyxFQUF3RCxJQUFDLENBQUEsSUFBekQsQ0FBVjthQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFVLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWYsQ0FBa0MsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE1BQUQ7QUFDMUMsY0FBQTtVQUFBLFVBQUEsR0FBYSxNQUFNLENBQUMsa0JBQVAsQ0FBMEIsU0FBQTtBQUFHLGdCQUFBO3FEQUFPLENBQUUsTUFBVCxDQUFBO1VBQUgsQ0FBMUI7aUJBQ2IsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsU0FBQTttQkFBRyxVQUFVLENBQUMsT0FBWCxDQUFBO1VBQUgsQ0FBcEI7UUFGMEM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxDLENBQVY7SUFQUTs7eUJBWVYsVUFBQSxHQUFZLFNBQUE7QUFDVixVQUFBOztXQUFLLENBQUUsT0FBUCxDQUFBOztNQUNBLElBQUMsQ0FBQSxJQUFELEdBQVE7O1lBQ0QsQ0FBRSxPQUFULENBQUE7O01BQ0EsSUFBQyxDQUFBLE1BQUQsR0FBVTs7WUFDSCxDQUFFLE9BQVQsQ0FBQTs7YUFDQSxJQUFDLENBQUEsTUFBRCxHQUFVO0lBTkE7O3lCQVNaLElBQUEsR0FBTSxTQUFBO0FBQ0osVUFBQTtNQUFBLElBQU8sbUJBQVA7UUFDRSxnQkFBQSxHQUFtQixPQUFBLENBQVEsc0JBQVI7UUFDbkIsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLGdCQUFBLENBQWlCLElBQUMsQ0FBQSxNQUFsQixFQUZoQjs7YUFHQSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsQ0FBQTtJQUpJOzt5QkFPTixnQkFBQSxHQUFrQixTQUFDLFNBQUQ7YUFDaEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLENBQWUsU0FBZjtJQURnQjs7Ozs7O0VBR3BCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLElBQUk7QUE3Q3JCIiwic291cmNlc0NvbnRlbnQiOlsiIyBQdWJsaWM6IFBhY2thZ2UgZm9yIGNvbnRyb2xpbmcgYW5kIG1vbml0b3JpbmcgdGFiIHNldHRpbmdzLlxuY2xhc3MgVGFiQ29udHJvbFxuICBjb25maWc6XG4gICAgYXV0b1NhdmVDaGFuZ2VzOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRpc3BsYXlJblN0YXR1c0JhcjpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuXG4gIGRpYWxvZzogbnVsbFxuICBzdGF0dXM6IG51bGxcbiAgc3ViczogbnVsbFxuXG4gICMgUHVibGljOiBDcmVhdGVzIHN0YXR1cyBiYXIgaW5kaWNhdG9yIGFuZCBzZXRzIHVwIGNvbW1hbmRzIGZvciBjb250cm9sIGRpYWxvZy5cbiAgYWN0aXZhdGU6IC0+XG4gICAgIyBwZXJmb3JtYW5jZSBvcHRpbWl6YXRpb246IHJlcXVpcmUgb25seSBhZnRlciBhY3RpdmF0aW9uXG4gICAge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbiAgICBUYWJDb250cm9sU3RhdHVzID0gcmVxdWlyZSAnLi90YWItY29udHJvbC1zdGF0dXMnXG4gICAgQHN1YnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBzdGF0dXMgPSBuZXcgVGFiQ29udHJvbFN0YXR1c1xuICAgIEBzdWJzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAndGFiLWNvbnRyb2w6c2hvdycsIEBzaG93XG4gICAgQHN1YnMuYWRkIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgZGlzcG9zYWJsZSA9IGVkaXRvci5vbkRpZENoYW5nZUdyYW1tYXIgPT4gQHN0YXR1cz8udXBkYXRlKClcbiAgICAgIGVkaXRvci5vbkRpZERlc3Ryb3kgLT4gZGlzcG9zYWJsZS5kaXNwb3NlKClcblxuICAjIFB1YmxpYzogUmVtb3ZlcyBzdGF0dXMgYmFyIGluZGljYXRvciBhbmQgZGVzdHJveSBjb250cm9sIGRpYWxvZy5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAc3Vicz8uZGlzcG9zZSgpXG4gICAgQHN1YnMgPSBudWxsXG4gICAgQGRpYWxvZz8uZGVzdHJveSgpXG4gICAgQGRpYWxvZyA9IG51bGxcbiAgICBAc3RhdHVzPy5kZXN0cm95KClcbiAgICBAc3RhdHVzID0gbnVsbFxuXG4gICMgUHVibGljOiBTaG93cyBjb250cm9sIGRpYWxvZy5cbiAgc2hvdzogPT4gIyBmYXQgYXJyb3cgcmVxdWlyZWRcbiAgICB1bmxlc3MgQGRpYWxvZz9cbiAgICAgIFRhYkNvbnRyb2xEaWFsb2cgPSByZXF1aXJlICcuL3RhYi1jb250cm9sLWRpYWxvZydcbiAgICAgIEBkaWFsb2cgPSBuZXcgVGFiQ29udHJvbERpYWxvZyBAc3RhdHVzXG4gICAgQGRpYWxvZy50b2dnbGUoKVxuXG4gICMgUHJpdmF0ZTogQXR0YWNoZXMgc3RhdHVzIGJhciBpbmRpY2F0b3IgdG8gd29ya3NwYWNlIHN0YXR1cyBiYXIuXG4gIGNvbnN1bWVTdGF0dXNCYXI6IChzdGF0dXNCYXIpIC0+XG4gICAgQHN0YXR1cy5hdHRhY2ggc3RhdHVzQmFyXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFRhYkNvbnRyb2xcbiJdfQ==
