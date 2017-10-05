(function() {
  var CompositeDisposable, TabControlStatus, View,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  View = require('atom-space-pen-views').View;

  module.exports = TabControlStatus = (function(superClass) {
    extend(TabControlStatus, superClass);

    function TabControlStatus() {
      return TabControlStatus.__super__.constructor.apply(this, arguments);
    }

    TabControlStatus.prototype.displayInStatusBar = true;

    TabControlStatus.prototype.subs = null;

    TabControlStatus.prototype.tile = null;

    TabControlStatus.content = function() {
      return this.a({
        "class": "tab-control-status inline-block"
      });
    };

    TabControlStatus.prototype.initialize = function() {
      this.subs = new CompositeDisposable;
      return this;
    };

    TabControlStatus.prototype.destroy = function() {
      var ref, ref1;
      if ((ref = this.tile) != null) {
        ref.destroy();
      }
      this.tile = null;
      if ((ref1 = this.sub) != null) {
        ref1.dispose();
      }
      return this.sub = null;
    };

    TabControlStatus.prototype.update = function() {
      var editor, length, type;
      editor = atom.workspace.getActiveTextEditor();
      if (editor && this.displayInStatusBar) {
        type = editor.getSoftTabs() ? 'Spaces' : 'Tabs';
        length = editor.getTabLength();
        this.text(type + ": " + length);
        return this.show();
      } else {
        return this.hide();
      }
    };

    TabControlStatus.prototype.attach = function(statusBar) {
      this.tile = statusBar.addRightTile({
        item: this,
        priority: 10
      });
      this.handleEvents();
      return this.update();
    };

    TabControlStatus.prototype.handleEvents = function() {
      this.click(function() {
        return atom.commands.dispatch(atom.views.getView(atom.workspace), 'tab-control:show');
      });
      this.subs.add(atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function() {
          return _this.update();
        };
      })(this)));
      return this.subs.add(atom.config.observe('tab-control.displayInStatusBar', (function(_this) {
        return function() {
          return _this.updateConfig();
        };
      })(this)));
    };

    TabControlStatus.prototype.updateConfig = function() {
      return this.displayInStatusBar = atom.config.get('tab-control.displayInStatusBar');
    };

    return TabControlStatus;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2FydHJlLy5hdG9tL3BhY2thZ2VzL3RhYi1jb250cm9sL2xpYi90YWItY29udHJvbC1zdGF0dXMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwyQ0FBQTtJQUFBOzs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3ZCLE9BQVEsT0FBQSxDQUFRLHNCQUFSOztFQUVULE1BQU0sQ0FBQyxPQUFQLEdBR007Ozs7Ozs7K0JBQ0osa0JBQUEsR0FBb0I7OytCQUNwQixJQUFBLEdBQU07OytCQUNOLElBQUEsR0FBTTs7SUFHTixnQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLENBQUQsQ0FBRztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8saUNBQVA7T0FBSDtJQURROzsrQkFJVixVQUFBLEdBQVksU0FBQTtNQUNWLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBSTthQUNaO0lBRlU7OytCQUtaLE9BQUEsR0FBUyxTQUFBO0FBQ1AsVUFBQTs7V0FBSyxDQUFFLE9BQVAsQ0FBQTs7TUFDQSxJQUFDLENBQUEsSUFBRCxHQUFROztZQUNKLENBQUUsT0FBTixDQUFBOzthQUNBLElBQUMsQ0FBQSxHQUFELEdBQU87SUFKQTs7K0JBT1QsTUFBQSxHQUFRLFNBQUE7QUFDTixVQUFBO01BQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQTtNQUNULElBQUcsTUFBQSxJQUFXLElBQUMsQ0FBQSxrQkFBZjtRQUNFLElBQUEsR0FBVSxNQUFNLENBQUMsV0FBUCxDQUFBLENBQUgsR0FBNkIsUUFBN0IsR0FBMkM7UUFDbEQsTUFBQSxHQUFTLE1BQU0sQ0FBQyxZQUFQLENBQUE7UUFDVCxJQUFDLENBQUEsSUFBRCxDQUFTLElBQUQsR0FBTSxJQUFOLEdBQVUsTUFBbEI7ZUFDQSxJQUFDLENBQUEsSUFBRCxDQUFBLEVBSkY7T0FBQSxNQUFBO2VBTUUsSUFBQyxDQUFBLElBQUQsQ0FBQSxFQU5GOztJQUZNOzsrQkFXUixNQUFBLEdBQVEsU0FBQyxTQUFEO01BQ04sSUFBQyxDQUFBLElBQUQsR0FBUSxTQUFTLENBQUMsWUFBVixDQUNOO1FBQUEsSUFBQSxFQUFNLElBQU47UUFDQSxRQUFBLEVBQVUsRUFEVjtPQURNO01BR1IsSUFBQyxDQUFBLFlBQUQsQ0FBQTthQUNBLElBQUMsQ0FBQSxNQUFELENBQUE7SUFMTTs7K0JBUVIsWUFBQSxHQUFjLFNBQUE7TUFDWixJQUFDLENBQUEsS0FBRCxDQUFPLFNBQUE7ZUFDTCxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QixDQUF2QixFQUEyRCxrQkFBM0Q7TUFESyxDQUFQO01BRUEsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQVUsSUFBSSxDQUFDLFNBQVMsQ0FBQyx5QkFBZixDQUF5QyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ2pELEtBQUMsQ0FBQSxNQUFELENBQUE7UUFEaUQ7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpDLENBQVY7YUFFQSxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBVSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsZ0NBQXBCLEVBQXNELENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDOUQsS0FBQyxDQUFBLFlBQUQsQ0FBQTtRQUQ4RDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEQsQ0FBVjtJQUxZOzsrQkFTZCxZQUFBLEdBQWMsU0FBQTthQUNaLElBQUMsQ0FBQSxrQkFBRCxHQUFzQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsZ0NBQWhCO0lBRFY7Ozs7S0FsRGU7QUFOL0IiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xue1ZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cbm1vZHVsZS5leHBvcnRzID1cblxuIyBTdGF0dXMgYmFyIGluZGljYXRvciBzaG93aW5nIGN1cnJlbnQgdGFiIHNldHRpbmdzLlxuY2xhc3MgVGFiQ29udHJvbFN0YXR1cyBleHRlbmRzIFZpZXdcbiAgZGlzcGxheUluU3RhdHVzQmFyOiB0cnVlXG4gIHN1YnM6IG51bGxcbiAgdGlsZTogbnVsbFxuXG4gICMgUHJpdmF0ZTogU2V0dXAgc3BhY2UtcGVuIHZpZXcgdGVtcGxhdGUuXG4gIEBjb250ZW50OiAtPlxuICAgIEBhIGNsYXNzOiBcInRhYi1jb250cm9sLXN0YXR1cyBpbmxpbmUtYmxvY2tcIlxuXG4gICMgUHVibGljOiBDcmVhdGVzIG5ldyBpbmRpY2F0b3Igdmlldy5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBAc3VicyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgdGhpc1xuXG4gICMgUHVibGljOiBkZXN0cm95IHZpZXcsIHJlbW92ZSBmcm9tIHN0YXR1cyBiYXIuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQHRpbGU/LmRlc3Ryb3koKVxuICAgIEB0aWxlID0gbnVsbFxuICAgIEBzdWI/LmRpc3Bvc2UoKVxuICAgIEBzdWIgPSBudWxsXG5cbiAgIyBQdWJsaWM6IHVwZGF0ZXMgdmlldyB3aXRoIGN1cnJlbnQgc2V0dGluZ3MuXG4gIHVwZGF0ZTogLT5cbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBpZiBlZGl0b3IgYW5kIEBkaXNwbGF5SW5TdGF0dXNCYXJcbiAgICAgIHR5cGUgPSBpZiBlZGl0b3IuZ2V0U29mdFRhYnMoKSB0aGVuICdTcGFjZXMnIGVsc2UgJ1RhYnMnXG4gICAgICBsZW5ndGggPSBlZGl0b3IuZ2V0VGFiTGVuZ3RoKClcbiAgICAgIEB0ZXh0IFwiI3t0eXBlfTogI3tsZW5ndGh9XCJcbiAgICAgIEBzaG93KClcbiAgICBlbHNlXG4gICAgICBAaGlkZSgpXG5cbiAgIyBQdWJsaWM6IEF0dGFjaGVzIGluZGljYXRvciB2aWV3IHRvIGdpdmVuIHN0YXR1cyBiYXIuXG4gIGF0dGFjaDogKHN0YXR1c0JhcikgLT5cbiAgICBAdGlsZSA9IHN0YXR1c0Jhci5hZGRSaWdodFRpbGVcbiAgICAgIGl0ZW06IHRoaXNcbiAgICAgIHByaW9yaXR5OiAxMFxuICAgIEBoYW5kbGVFdmVudHMoKVxuICAgIEB1cGRhdGUoKVxuXG4gICMgUHJpdmF0ZTogU2V0cyB1cCBldmVudCBoYW5kbGVycyBmb3IgaW5kaWNhdG9yLlxuICBoYW5kbGVFdmVudHM6IC0+XG4gICAgQGNsaWNrIC0+XG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoIGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksICd0YWItY29udHJvbDpzaG93J1xuICAgIEBzdWJzLmFkZCBhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtID0+XG4gICAgICBAdXBkYXRlKClcbiAgICBAc3Vicy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAndGFiLWNvbnRyb2wuZGlzcGxheUluU3RhdHVzQmFyJywgPT5cbiAgICAgIEB1cGRhdGVDb25maWcoKVxuXG4gICMgUHJpdmF0ZTogVXBkYXRlcyBjYWNoZSBvZiBhdG9tIGNvbmZpZyBzZXR0aW5ncyBmb3IgdGhpcyBwYWNrYWdlLlxuICB1cGRhdGVDb25maWc6IC0+XG4gICAgQGRpc3BsYXlJblN0YXR1c0JhciA9IGF0b20uY29uZmlnLmdldCAndGFiLWNvbnRyb2wuZGlzcGxheUluU3RhdHVzQmFyJ1xuIl19
