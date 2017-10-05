(function() {
  var SelectListView, TabControlDialog,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  SelectListView = require('atom-space-pen-views').SelectListView;

  module.exports = TabControlDialog = (function(superClass) {
    extend(TabControlDialog, superClass);

    function TabControlDialog() {
      return TabControlDialog.__super__.constructor.apply(this, arguments);
    }

    TabControlDialog.prototype.autoSaveChanges = false;

    TabControlDialog.prototype.sub = null;

    TabControlDialog.prototype.initialize = function(status) {
      this.status = status;
      TabControlDialog.__super__.initialize.apply(this, arguments);
      this.addClass('tab-control');
      this.list.addClass('mark-active');
      return this;
    };

    TabControlDialog.prototype.destroy = function() {
      if (typeof sub !== "undefined" && sub !== null) {
        sub.dispose();
      }
      return this.cancel();
    };

    TabControlDialog.prototype.toggle = function() {
      if (this.panel != null) {
        return this.cancel();
      } else if (this.editor = atom.workspace.getActiveTextEditor()) {
        this.setItems(this.getTabControlItems());
        return this.attach();
      }
    };

    TabControlDialog.prototype.getFilterKey = function() {
      return 'name';
    };

    TabControlDialog.prototype.viewForItem = function(item) {
      var element;
      if ((item.seperator != null) && item.seperator) {
        element = document.createElement('li');
        element.classList.add('seperator');
      } else {
        element = document.createElement('li');
        if ((item.active != null) && item.active) {
          element.classList.add('active');
        }
        if (item.name != null) {
          element.textContent = item.name;
        }
      }
      return element;
    };

    TabControlDialog.prototype.selectPreviousItemView = function() {
      var view;
      view = this.getSelectedItemView().prev();
      if (view.hasClass('seperator')) {
        view = view.prev();
      }
      if (!view.length) {
        view = this.list.find('li:last');
      }
      return this.selectItemView(view);
    };

    TabControlDialog.prototype.selectNextItemView = function() {
      var view;
      view = this.getSelectedItemView().next();
      if (view.hasClass('seperator')) {
        view = view.next();
      }
      if (!view.length) {
        view = this.list.find('li:first');
      }
      return this.selectItemView(view);
    };

    TabControlDialog.prototype.getTabControlItems = function() {
      var currentTabLength, i, items, len, n, ref, workspace;
      currentTabLength = this.editor.getTabLength();
      items = [];
      items.push({
        name: "Indent Using Spaces",
        command: (function(_this) {
          return function(value) {
            return _this.editor.toggleSoftTabs();
          };
        })(this),
        active: this.editor.getSoftTabs()
      });
      items.push({
        seperator: true
      });
      ref = [1, 2, 3, 4, 8];
      for (i = 0, len = ref.length; i < len; i++) {
        n = ref[i];
        items.push({
          name: "Tab Length: " + n,
          value: n,
          command: (function(_this) {
            return function(value) {
              return _this.editor.setTabLength(value);
            };
          })(this),
          active: currentTabLength === n
        });
      }
      if (atom.packages.getActivePackage('tabs-to-spaces') != null) {
        workspace = atom.views.getView(atom.workspace);
        items.push({
          seperator: true
        });
        items.push({
          name: 'Tabs To Spaces: Tabify',
          command: function(value) {
            return atom.commands.dispatch(workspace, 'tabs-to-spaces:tabify');
          }
        });
        items.push({
          name: 'Tabs To Spaces: Untabify',
          command: function(value) {
            return atom.commands.dispatch(workspace, 'tabs-to-spaces:untabify');
          }
        });
        items.push({
          name: 'Tabs To Spaces: Untabify All',
          command: function(value) {
            return atom.commands.dispatch(workspace, 'tabs-to-spaces:untabify-all');
          }
        });
      }
      return items;
    };

    TabControlDialog.prototype.cancelled = function() {
      var ref;
      if ((ref = this.panel) != null) {
        ref.destroy();
      }
      this.panel = null;
      return this.editor = null;
    };

    TabControlDialog.prototype.confirmed = function(item) {
      var ref;
      if (item == null) {
        return;
      }
      if (item.command == null) {
        return;
      }
      if (item.value != null) {
        item.command(item.value);
      } else {
        item.command();
      }
      if ((ref = this.status) != null) {
        ref.update();
      }
      if (this.autoSaveChanges) {
        this.saveChanges();
      }
      return this.cancel();
    };

    TabControlDialog.prototype.saveChanges = function() {
      var ref, ref1, scope;
      scope = (ref = atom.workspace.getActiveTextEditor()) != null ? (ref1 = ref.getGrammar()) != null ? ref1.scopeName : void 0 : void 0;
      if (scope == null) {
        return;
      }
      atom.config.set('editor.tabLength', this.editor.getTabLength(), {
        scopeSelector: "." + scope
      });
      return atom.config.set('editor.softTabs', this.editor.getSoftTabs(), {
        scopeSelector: "." + scope
      });
    };

    TabControlDialog.prototype.attach = function() {
      this.storeFocusedElement();
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.focusFilterEditor();
      return this.sub = atom.config.observe('tab-control.autoSaveChanges', (function(_this) {
        return function() {
          return _this.updateConfig();
        };
      })(this));
    };

    TabControlDialog.prototype.updateConfig = function() {
      return this.autoSaveChanges = atom.config.get('tab-control.autoSaveChanges');
    };

    return TabControlDialog;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2FydHJlLy5hdG9tL3BhY2thZ2VzL3RhYi1jb250cm9sL2xpYi90YWItY29udHJvbC1kaWFsb2cuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxnQ0FBQTtJQUFBOzs7RUFBQyxpQkFBa0IsT0FBQSxDQUFRLHNCQUFSOztFQUVuQixNQUFNLENBQUMsT0FBUCxHQUdNOzs7Ozs7OytCQUNKLGVBQUEsR0FBaUI7OytCQUNqQixHQUFBLEdBQUs7OytCQUdMLFVBQUEsR0FBWSxTQUFDLE1BQUQ7TUFBQyxJQUFDLENBQUEsU0FBRDtNQUNYLGtEQUFBLFNBQUE7TUFDQSxJQUFDLENBQUEsUUFBRCxDQUFVLGFBQVY7TUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQU4sQ0FBZSxhQUFmO2FBQ0E7SUFKVTs7K0JBT1osT0FBQSxHQUFTLFNBQUE7O1FBQ1AsR0FBRyxDQUFFLE9BQUwsQ0FBQTs7YUFDQSxJQUFDLENBQUEsTUFBRCxDQUFBO0lBRk87OytCQUtULE1BQUEsR0FBUSxTQUFBO01BQ04sSUFBRyxrQkFBSDtlQUNFLElBQUMsQ0FBQSxNQUFELENBQUEsRUFERjtPQUFBLE1BRUssSUFBRyxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFiO1FBQ0gsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFDLENBQUEsa0JBQUQsQ0FBQSxDQUFWO2VBQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQUZHOztJQUhDOzsrQkFRUixZQUFBLEdBQWMsU0FBQTthQUNaO0lBRFk7OytCQUlkLFdBQUEsR0FBYSxTQUFDLElBQUQ7QUFDWCxVQUFBO01BQUEsSUFBRyx3QkFBQSxJQUFvQixJQUFJLENBQUMsU0FBNUI7UUFDRSxPQUFBLEdBQVUsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsSUFBdkI7UUFDVixPQUFPLENBQUMsU0FBUyxDQUFDLEdBQWxCLENB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QixFQUFtQyxJQUFDLENBQUEsTUFBTSxDQUFDLFdBQVIsQ0FBQSxDQUFuQyxFQUNFO1FBQUEsYUFBQSxFQUFlLEdBQUEsR0FBSSxLQUFuQjtPQURGO0lBTFc7OytCQVNiLE1BQUEsR0FBUSxTQUFBO01BQ04sSUFBQyxDQUFBLG1CQUFELENBQUE7O1FBQ0EsSUFBQyxDQUFBLFFBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQ1I7VUFBQSxJQUFBLEVBQU0sSUFBTjtTQURROztNQUVWLElBQUMsQ0FBQSxpQkFBRCxDQUFBO2FBQ0EsSUFBQyxDQUFBLEdBQUQsR0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsNkJBQXBCLEVBQW1ELENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDeEQsS0FBQyxDQUFBLFlBQUQsQ0FBQTtRQUR3RDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkQ7SUFMRDs7K0JBU1IsWUFBQSxHQUFjLFNBQUE7YUFDWixJQUFDLENBQUEsZUFBRCxHQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNkJBQWhCO0lBRFA7Ozs7S0F4SGU7QUFML0IiLCJzb3VyY2VzQ29udGVudCI6WyJ7U2VsZWN0TGlzdFZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cbm1vZHVsZS5leHBvcnRzID1cblxuIyBQdWJsaWM6IENvbnRyb2wgZGlhbG9nIG9mZmVyaW5nIGNvbnRyb2wgb3ZlciB0YWIgc2V0dGluZ3MuXG5jbGFzcyBUYWJDb250cm9sRGlhbG9nIGV4dGVuZHMgU2VsZWN0TGlzdFZpZXdcbiAgYXV0b1NhdmVDaGFuZ2VzOiBmYWxzZVxuICBzdWI6IG51bGxcblxuICAjIFB1YmxpYzogQ3JlYXRlIG5ldyBjb250cm9sIGRpYWxvZyB2aWV3LlxuICBpbml0aWFsaXplOiAoQHN0YXR1cykgLT5cbiAgICBzdXBlclxuICAgIEBhZGRDbGFzcyAndGFiLWNvbnRyb2wnXG4gICAgQGxpc3QuYWRkQ2xhc3MgJ21hcmstYWN0aXZlJ1xuICAgIHRoaXNcblxuICAjIFB1YmxpYzogZGVzdHJveSB2aWV3LCBjYW5jZWwgYW55IHNlbGVjdGlvbi5cbiAgZGVzdHJveTogLT5cbiAgICBzdWI/LmRpc3Bvc2UoKVxuICAgIEBjYW5jZWwoKVxuXG4gICMgUHVibGljOiBTaG93cyBvciBoaWRlcyBjb250cm9sIGRpYWxvZy5cbiAgdG9nZ2xlOiAtPlxuICAgIGlmIEBwYW5lbD9cbiAgICAgIEBjYW5jZWwoKVxuICAgIGVsc2UgaWYgQGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgQHNldEl0ZW1zIEBnZXRUYWJDb250cm9sSXRlbXMoKVxuICAgICAgQGF0dGFjaCgpXG5cbiAgIyBQcml2YXRlOiBEZWZpbmVzIGZ1enp5IGZpbmQgaXRlbSBwcm9wZXJ0eS5cbiAgZ2V0RmlsdGVyS2V5OiAtPlxuICAgICduYW1lJ1xuXG4gICMgUHJpdmF0ZTogUmV0dXJucyBlbGVtZW50IGZvciBlYWNoIGl0ZW0gaW4gdmlldy5cbiAgdmlld0Zvckl0ZW06IChpdGVtKSAtPlxuICAgIGlmIGl0ZW0uc2VwZXJhdG9yPyBhbmQgaXRlbS5zZXBlcmF0b3JcbiAgICAgIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50ICdsaSdcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCAnc2VwZXJhdG9yJ1xuICAgIGVsc2VcbiAgICAgIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50ICdsaSdcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCAnYWN0aXZlJyBpZiBpdGVtLmFjdGl2ZT8gYW5kIGl0ZW0uYWN0aXZlXG4gICAgICBlbGVtZW50LnRleHRDb250ZW50ID0gaXRlbS5uYW1lIGlmIGl0ZW0ubmFtZT9cbiAgICBlbGVtZW50XG5cbiAgIyBQcml2YXRlOiBPdmVycmlkZSBTZWxlY3RMaXN0VmlldyB0byBza2lwIG92ZXIgc2VwZXJhdG9ycy5cbiAgc2VsZWN0UHJldmlvdXNJdGVtVmlldzogLT5cbiAgICB2aWV3ID0gQGdldFNlbGVjdGVkSXRlbVZpZXcoKS5wcmV2KClcbiAgICB2aWV3ID0gdmlldy5wcmV2KCkgaWYgdmlldy5oYXNDbGFzcygnc2VwZXJhdG9yJylcbiAgICB2aWV3ID0gQGxpc3QuZmluZCgnbGk6bGFzdCcpIHVubGVzcyB2aWV3Lmxlbmd0aFxuICAgIEBzZWxlY3RJdGVtVmlldyh2aWV3KVxuXG4gICMgUHJpdmF0ZTogT3ZlcnJpZGUgU2VsZWN0TGlzdFZpZXcgdG8gc2tpcCBvdmVyIHNlcGVyYXRvcnMuXG4gIHNlbGVjdE5leHRJdGVtVmlldzogLT5cbiAgICB2aWV3ID0gQGdldFNlbGVjdGVkSXRlbVZpZXcoKS5uZXh0KClcbiAgICB2aWV3ID0gdmlldy5uZXh0KCkgaWYgdmlldy5oYXNDbGFzcygnc2VwZXJhdG9yJylcbiAgICB2aWV3ID0gQGxpc3QuZmluZCgnbGk6Zmlyc3QnKSB1bmxlc3Mgdmlldy5sZW5ndGhcbiAgICBAc2VsZWN0SXRlbVZpZXcodmlldylcblxuICAjIFByaXZhdGU6IEdldHMgaXRlbXMgZm9yIGNvbnRyb2wgZGlhbG9nIHZpZXcuXG4gIGdldFRhYkNvbnRyb2xJdGVtczogLT5cbiAgICBjdXJyZW50VGFiTGVuZ3RoID0gQGVkaXRvci5nZXRUYWJMZW5ndGgoKVxuICAgIGl0ZW1zID0gW11cbiAgICBpdGVtcy5wdXNoXG4gICAgICBuYW1lOiBcIkluZGVudCBVc2luZyBTcGFjZXNcIlxuICAgICAgY29tbWFuZDogKHZhbHVlKSA9PiBAZWRpdG9yLnRvZ2dsZVNvZnRUYWJzKClcbiAgICAgIGFjdGl2ZTogQGVkaXRvci5nZXRTb2Z0VGFicygpXG4gICAgaXRlbXMucHVzaCB7c2VwZXJhdG9yOiB0cnVlfVxuICAgIGZvciBuIGluIFsxLCAyLCAzLCA0LCA4XVxuICAgICAgaXRlbXMucHVzaFxuICAgICAgICBuYW1lOiBcIlRhYiBMZW5ndGg6ICN7bn1cIlxuICAgICAgICB2YWx1ZTogblxuICAgICAgICBjb21tYW5kOiAodmFsdWUpID0+IEBlZGl0b3Iuc2V0VGFiTGVuZ3RoIHZhbHVlXG4gICAgICAgIGFjdGl2ZTogY3VycmVudFRhYkxlbmd0aCBpcyBuXG4gICAgaWYgYXRvbS5wYWNrYWdlcy5nZXRBY3RpdmVQYWNrYWdlKCd0YWJzLXRvLXNwYWNlcycpP1xuICAgICAgd29ya3NwYWNlID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKVxuICAgICAgaXRlbXMucHVzaCB7c2VwZXJhdG9yOiB0cnVlfVxuICAgICAgaXRlbXMucHVzaFxuICAgICAgICBuYW1lOiAnVGFicyBUbyBTcGFjZXM6IFRhYmlmeSdcbiAgICAgICAgY29tbWFuZDogKHZhbHVlKSAtPiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoIHdvcmtzcGFjZSwgJ3RhYnMtdG8tc3BhY2VzOnRhYmlmeSdcbiAgICAgIGl0ZW1zLnB1c2hcbiAgICAgICAgbmFtZTogJ1RhYnMgVG8gU3BhY2VzOiBVbnRhYmlmeSdcbiAgICAgICAgY29tbWFuZDogKHZhbHVlKSAtPiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoIHdvcmtzcGFjZSwgJ3RhYnMtdG8tc3BhY2VzOnVudGFiaWZ5J1xuICAgICAgaXRlbXMucHVzaFxuICAgICAgICBuYW1lOiAnVGFicyBUbyBTcGFjZXM6IFVudGFiaWZ5IEFsbCdcbiAgICAgICAgY29tbWFuZDogKHZhbHVlKSAtPiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoIHdvcmtzcGFjZSwgJ3RhYnMtdG8tc3BhY2VzOnVudGFiaWZ5LWFsbCdcbiAgICBpdGVtc1xuXG4gICMgUHJpdmF0ZTogQ2FsbGVkIHdoZW4gc2VsZWN0aW9uIGlzIGNhbmNlbGVkLlxuICBjYW5jZWxsZWQ6IC0+XG4gICAgQHBhbmVsPy5kZXN0cm95KClcbiAgICBAcGFuZWwgPSBudWxsXG4gICAgQGVkaXRvciA9IG51bGxcblxuICAjIFByaXZhdGU6IENhbGxlZCB3aGVuIHNlbGVjdGlvbiBpcyBtYWRlLlxuICBjb25maXJtZWQ6IChpdGVtKSAtPlxuICAgIHJldHVybiB1bmxlc3MgaXRlbT9cbiAgICByZXR1cm4gdW5sZXNzIGl0ZW0uY29tbWFuZD9cbiAgICBpZiBpdGVtLnZhbHVlP1xuICAgICAgaXRlbS5jb21tYW5kIGl0ZW0udmFsdWVcbiAgICBlbHNlXG4gICAgICBpdGVtLmNvbW1hbmQoKVxuICAgIEBzdGF0dXM/LnVwZGF0ZSgpXG4gICAgaWYgQGF1dG9TYXZlQ2hhbmdlc1xuICAgICAgQHNhdmVDaGFuZ2VzKClcbiAgICBAY2FuY2VsKClcblxuICAjIFByaXZhdGU6IFNhdmVzIGN1cnJlbnQgc2V0dGluZ3MgdG8gYXRvbSBjb25maWcuXG4gIHNhdmVDaGFuZ2VzOiAtPlxuICAgIHNjb3BlID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpPy5nZXRHcmFtbWFyKCk/LnNjb3BlTmFtZVxuICAgIHJldHVybiB1bmxlc3Mgc2NvcGU/XG4gICAgYXRvbS5jb25maWcuc2V0ICdlZGl0b3IudGFiTGVuZ3RoJywgQGVkaXRvci5nZXRUYWJMZW5ndGgoKSxcbiAgICAgIHNjb3BlU2VsZWN0b3I6IFwiLiN7c2NvcGV9XCJcbiAgICBhdG9tLmNvbmZpZy5zZXQgJ2VkaXRvci5zb2Z0VGFicycsIEBlZGl0b3IuZ2V0U29mdFRhYnMoKSxcbiAgICAgIHNjb3BlU2VsZWN0b3I6IFwiLiN7c2NvcGV9XCJcblxuICAjIFByaXZhdGU6IEF0dGFjaCBkaWFsb2cgdmlldyB0byB3b3Jrc3BhY2UuXG4gIGF0dGFjaDogLT5cbiAgICBAc3RvcmVGb2N1c2VkRWxlbWVudCgpXG4gICAgQHBhbmVsID89IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWxcbiAgICAgIGl0ZW06IHRoaXNcbiAgICBAZm9jdXNGaWx0ZXJFZGl0b3IoKVxuICAgIEBzdWIgPSBhdG9tLmNvbmZpZy5vYnNlcnZlICd0YWItY29udHJvbC5hdXRvU2F2ZUNoYW5nZXMnLCA9PlxuICAgICAgQHVwZGF0ZUNvbmZpZygpXG5cbiAgIyBQcml2YXRlOiBVcGRhdGVzIGNhY2hlIG9mIGF0b20gY29uZmlnIHNldHRpbmdzIGZvciB0aGlzIHBhY2thZ2UuXG4gIHVwZGF0ZUNvbmZpZzogLT5cbiAgICBAYXV0b1NhdmVDaGFuZ2VzID0gYXRvbS5jb25maWcuZ2V0ICd0YWItY29udHJvbC5hdXRvU2F2ZUNoYW5nZXMnXG4iXX0=
