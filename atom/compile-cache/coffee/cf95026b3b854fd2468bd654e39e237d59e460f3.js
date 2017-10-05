(function() {
  var AtomTodoist, CompositeDisposable, Main;

  AtomTodoist = require('./atom-todoist');

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = Main = {
    atomTodoist: null,
    rightPanel: null,
    subscriptions: null,
    toggled: false,
    config: {
      token: {
        type: 'string',
        "default": '',
        title: 'Token Todoist',
        description: 'Insert the Todoist API Token'
      }
    },
    activate: function(state) {
      this.subscriptions = new CompositeDisposable;
      return this.subscriptions.add(atom.commands.add('atom-workspace', {
        'main:toggle': (function(_this) {
          return function() {
            return _this.toggle(state);
          };
        })(this)
      }));
    },
    deactivate: function() {
      this.rightPanel.destroy();
      this.subscriptions.dispose();
      return this.atomTodoist.destroy();
    },
    serialize: function() {
      return {
        atomTodoistState: this.atomTodoist.serialize()
      };
    },
    toggle: function(state) {
      if (atom.config.get('atom-todoist.token') === '') {
        return atom.notifications.addFatalError("Error", {
          detail: "Todoist could not find any token\nPlease insert your todoist token into the settings"
        });
      } else {
        if (this.toggled) {
          this.toggled = false;
          this.atomTodoist.updateTasks();
          this.rightPanel.destroy();
          return this.atomTodoist.destroy();
        } else {
          this.toggled = true;
          this.atomTodoist = new AtomTodoist(state.atomTodoistState);
          this.rightPanel = atom.workspace.addRightPanel({
            item: this.atomTodoist.getElement(),
            visible: false
          });
          return this.rightPanel.show();
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2FydHJlLy5hdG9tL3BhY2thZ2VzL2F0b20tdG9kb2lzdC9saWIvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVI7O0VBQ2Isc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUV4QixNQUFNLENBQUMsT0FBUCxHQUFpQixJQUFBLEdBQ2I7SUFBQSxXQUFBLEVBQWEsSUFBYjtJQUNBLFVBQUEsRUFBWSxJQURaO0lBRUEsYUFBQSxFQUFlLElBRmY7SUFHQSxPQUFBLEVBQVMsS0FIVDtJQUlBLE1BQUEsRUFDSTtNQUFBLEtBQUEsRUFDSTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQURUO1FBRUEsS0FBQSxFQUFNLGVBRk47UUFHQSxXQUFBLEVBQWEsOEJBSGI7T0FESjtLQUxKO0lBV0EsUUFBQSxFQUFVLFNBQUMsS0FBRDtNQUNOLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7YUFDckIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0M7UUFBQSxhQUFBLEVBQWUsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsTUFBRCxDQUFRLEtBQVI7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBZjtPQUFwQyxDQUFuQjtJQUZNLENBWFY7SUFlQSxVQUFBLEVBQVksU0FBQTtNQUNSLElBQUMsQ0FBQSxVQUFVLENBQUMsT0FBWixDQUFBO01BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUE7YUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsQ0FBQTtJQUhRLENBZlo7SUFvQkEsU0FBQSxFQUFXLFNBQUE7YUFDUDtRQUFBLGdCQUFBLEVBQWtCLElBQUMsQ0FBQSxXQUFXLENBQUMsU0FBYixDQUFBLENBQWxCOztJQURPLENBcEJYO0lBdUJBLE1BQUEsRUFBUSxTQUFDLEtBQUQ7TUFDSixJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixvQkFBaEIsQ0FBQSxLQUF5QyxFQUE1QztlQUNFLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBbkIsQ0FBaUMsT0FBakMsRUFBMEM7VUFBQSxNQUFBLEVBQVEsc0ZBQVI7U0FBMUMsRUFERjtPQUFBLE1BQUE7UUFHRSxJQUFHLElBQUMsQ0FBQSxPQUFKO1VBQ0UsSUFBQyxDQUFBLE9BQUQsR0FBVztVQUNYLElBQUMsQ0FBQSxXQUFXLENBQUMsV0FBYixDQUFBO1VBQ0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxPQUFaLENBQUE7aUJBQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLENBQUEsRUFKRjtTQUFBLE1BQUE7VUFNRSxJQUFDLENBQUEsT0FBRCxHQUFXO1VBQ1gsSUFBQyxDQUFBLFdBQUQsR0FBbUIsSUFBQSxXQUFBLENBQVksS0FBSyxDQUFDLGdCQUFsQjtVQUNuQixJQUFDLENBQUEsVUFBRCxHQUFjLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUE2QjtZQUFBLElBQUEsRUFBTSxJQUFDLENBQUEsV0FBVyxDQUFDLFVBQWIsQ0FBQSxDQUFOO1lBQWlDLE9BQUEsRUFBUyxLQUExQztXQUE3QjtpQkFDZCxJQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBQSxFQVRGO1NBSEY7O0lBREksQ0F2QlI7O0FBSkoiLCJzb3VyY2VzQ29udGVudCI6WyJBdG9tVG9kb2lzdCA9IHJlcXVpcmUgJy4vYXRvbS10b2RvaXN0J1xue0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxubW9kdWxlLmV4cG9ydHMgPSBNYWluID1cbiAgICBhdG9tVG9kb2lzdDogbnVsbFxuICAgIHJpZ2h0UGFuZWw6IG51bGxcbiAgICBzdWJzY3JpcHRpb25zOiBudWxsXG4gICAgdG9nZ2xlZDogZmFsc2VcbiAgICBjb25maWc6XG4gICAgICAgIHRva2VuOlxuICAgICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICAgICAgICB0aXRsZTonVG9rZW4gVG9kb2lzdCdcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnSW5zZXJ0IHRoZSBUb2RvaXN0IEFQSSBUb2tlbidcblxuICAgIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdtYWluOnRvZ2dsZSc6ID0+IEB0b2dnbGUoc3RhdGUpXG5cbiAgICBkZWFjdGl2YXRlOiAtPlxuICAgICAgICBAcmlnaHRQYW5lbC5kZXN0cm95KClcbiAgICAgICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgICAgIEBhdG9tVG9kb2lzdC5kZXN0cm95KClcblxuICAgIHNlcmlhbGl6ZTogLT5cbiAgICAgICAgYXRvbVRvZG9pc3RTdGF0ZTogQGF0b21Ub2RvaXN0LnNlcmlhbGl6ZSgpXG5cbiAgICB0b2dnbGU6IChzdGF0ZSktPlxuICAgICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tdG9kb2lzdC50b2tlbicpID09ICcnXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEZhdGFsRXJyb3IoXCJFcnJvclwiLCBkZXRhaWw6IFwiVG9kb2lzdCBjb3VsZCBub3QgZmluZCBhbnkgdG9rZW5cXG5QbGVhc2UgaW5zZXJ0IHlvdXIgdG9kb2lzdCB0b2tlbiBpbnRvIHRoZSBzZXR0aW5nc1wiKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgaWYgQHRvZ2dsZWRcbiAgICAgICAgICAgIEB0b2dnbGVkID0gZmFsc2VcbiAgICAgICAgICAgIEBhdG9tVG9kb2lzdC51cGRhdGVUYXNrcygpXG4gICAgICAgICAgICBAcmlnaHRQYW5lbC5kZXN0cm95KClcbiAgICAgICAgICAgIEBhdG9tVG9kb2lzdC5kZXN0cm95KClcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBAdG9nZ2xlZCA9IHRydWVcbiAgICAgICAgICAgIEBhdG9tVG9kb2lzdCA9IG5ldyBBdG9tVG9kb2lzdChzdGF0ZS5hdG9tVG9kb2lzdFN0YXRlKVxuICAgICAgICAgICAgQHJpZ2h0UGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRSaWdodFBhbmVsKGl0ZW06IEBhdG9tVG9kb2lzdC5nZXRFbGVtZW50KCksIHZpc2libGU6IGZhbHNlKVxuICAgICAgICAgICAgQHJpZ2h0UGFuZWwuc2hvdygpXG4iXX0=
