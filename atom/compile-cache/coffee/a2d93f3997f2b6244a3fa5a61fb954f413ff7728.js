(function() {
  var Base, CompositeDisposable, Disposable, Emitter, VimState, _, addClassList, forEachPaneAxis, globalState, ref, ref1, removeClassList, settings,
    slice = [].slice;

  _ = require('underscore-plus');

  ref = require('atom'), Disposable = ref.Disposable, Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable;

  Base = require('./base');

  globalState = require('./global-state');

  settings = require('./settings');

  VimState = require('./vim-state');

  ref1 = require('./utils'), forEachPaneAxis = ref1.forEachPaneAxis, addClassList = ref1.addClassList, removeClassList = ref1.removeClassList;

  module.exports = {
    config: settings.config,
    getStatusBarManager: function() {
      return this.statusBarManager != null ? this.statusBarManager : this.statusBarManager = new (require('./status-bar-manager'));
    },
    activate: function(state) {
      var developer, service;
      this.subscriptions = new CompositeDisposable;
      this.emitter = new Emitter;
      service = this.provideVimModePlus();
      this.subscribe(Base.init(service));
      this.registerCommands();
      this.registerVimStateCommands();
      settings.notifyDeprecatedParams();
      if (atom.inSpecMode()) {
        settings.set('strictAssertion', true);
      }
      if (atom.inDevMode()) {
        developer = new (require('./developer'));
        this.subscribe(developer.init(service));
      }
      this.subscribe(this.observeVimMode(function() {
        var message;
        message = "## Message by vim-mode-plus: vim-mode detected!\nTo use vim-mode-plus, you must **disable vim-mode** manually.";
        return atom.notifications.addWarning(message, {
          dismissable: true
        });
      }));
      this.subscribe(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          if (!editor.isMini()) {
            return _this.createVimState(editor);
          }
        };
      })(this)));
      this.subscribe(atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function() {
          return _this.demaximizePane();
        };
      })(this)));
      this.subscribe(atom.workspace.onDidChangeActivePaneItem(function() {
        if (settings.get('automaticallyEscapeInsertModeOnActivePaneItemChange')) {
          return VimState.forEach(function(vimState) {
            if (vimState.mode === 'insert') {
              return vimState.activate('normal');
            }
          });
        }
      }));
      this.subscribe(atom.workspace.onDidStopChangingActivePaneItem((function(_this) {
        return function(item) {
          var ref2;
          if (atom.workspace.isTextEditor(item) && !item.isMini()) {
            return (ref2 = _this.getEditorState(item)) != null ? ref2.highlightSearch.refresh() : void 0;
          }
        };
      })(this)));
      this.subscribe(globalState.onDidChange(function(arg1) {
        var name, newValue;
        name = arg1.name, newValue = arg1.newValue;
        if (name === 'highlightSearchPattern') {
          if (newValue) {
            return VimState.forEach(function(vimState) {
              return vimState.highlightSearch.refresh();
            });
          } else {
            return VimState.forEach(function(vimState) {
              if (vimState.__highlightSearch) {
                return vimState.highlightSearch.clearMarkers();
              }
            });
          }
        }
      }));
      this.subscribe(settings.observe('highlightSearch', function(newValue) {
        if (newValue) {
          return globalState.set('highlightSearchPattern', globalState.get('lastSearchPattern'));
        } else {
          return globalState.set('highlightSearchPattern', null);
        }
      }));
      return this.subscribe.apply(this, settings.observeConditionalKeymaps());
    },
    observeVimMode: function(fn) {
      if (atom.packages.isPackageActive('vim-mode')) {
        fn();
      }
      return atom.packages.onDidActivatePackage(function(pack) {
        if (pack.name === 'vim-mode') {
          return fn();
        }
      });
    },
    onDidAddVimState: function(fn) {
      return this.emitter.on('did-add-vim-state', fn);
    },
    observeVimStates: function(fn) {
      if (VimState != null) {
        VimState.forEach(fn);
      }
      return this.onDidAddVimState(fn);
    },
    clearPersistentSelectionForEditors: function() {
      var editor, i, len, ref2, results;
      ref2 = atom.workspace.getTextEditors();
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        editor = ref2[i];
        results.push(this.getEditorState(editor).clearPersistentSelections());
      }
      return results;
    },
    deactivate: function() {
      this.subscriptions.dispose();
      if (VimState != null) {
        VimState.forEach(function(vimState) {
          return vimState.destroy();
        });
      }
      return VimState != null ? VimState.clear() : void 0;
    },
    subscribe: function() {
      var args, ref2;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (ref2 = this.subscriptions).add.apply(ref2, args);
    },
    unsubscribe: function(arg) {
      return this.subscriptions.remove(arg);
    },
    registerCommands: function() {
      this.subscribe(atom.commands.add('atom-text-editor:not([mini])', {
        'vim-mode-plus:clear-highlight-search': function() {
          return globalState.set('highlightSearchPattern', null);
        },
        'vim-mode-plus:toggle-highlight-search': function() {
          return settings.toggle('highlightSearch');
        },
        'vim-mode-plus:clear-persistent-selection': (function(_this) {
          return function() {
            return _this.clearPersistentSelectionForEditors();
          };
        })(this)
      }));
      return this.subscribe(atom.commands.add('atom-workspace', {
        'vim-mode-plus:maximize-pane': (function(_this) {
          return function() {
            return _this.maximizePane();
          };
        })(this),
        'vim-mode-plus:equalize-panes': (function(_this) {
          return function() {
            return _this.equalizePanes();
          };
        })(this)
      }));
    },
    demaximizePane: function() {
      if (this.maximizePaneDisposable != null) {
        this.maximizePaneDisposable.dispose();
        this.unsubscribe(this.maximizePaneDisposable);
        return this.maximizePaneDisposable = null;
      }
    },
    maximizePane: function() {
      var classActivePaneAxis, classHideStatusBar, classHideTabBar, classPaneMaximized, getView, paneElement, workspaceClassNames, workspaceElement;
      if (this.maximizePaneDisposable != null) {
        this.demaximizePane();
        return;
      }
      getView = function(model) {
        return atom.views.getView(model);
      };
      classPaneMaximized = 'vim-mode-plus--pane-maximized';
      classHideTabBar = 'vim-mode-plus--hide-tab-bar';
      classHideStatusBar = 'vim-mode-plus--hide-status-bar';
      classActivePaneAxis = 'vim-mode-plus--active-pane-axis';
      workspaceElement = getView(atom.workspace);
      paneElement = getView(atom.workspace.getActivePane());
      workspaceClassNames = [classPaneMaximized];
      if (settings.get('hideTabBarOnMaximizePane')) {
        workspaceClassNames.push(classHideTabBar);
      }
      if (settings.get('hideStatusBarOnMaximizePane')) {
        workspaceClassNames.push(classHideStatusBar);
      }
      addClassList.apply(null, [workspaceElement].concat(slice.call(workspaceClassNames)));
      forEachPaneAxis(function(axis) {
        var paneAxisElement;
        paneAxisElement = getView(axis);
        if (paneAxisElement.contains(paneElement)) {
          return addClassList(paneAxisElement, classActivePaneAxis);
        }
      });
      this.maximizePaneDisposable = new Disposable(function() {
        forEachPaneAxis(function(axis) {
          return removeClassList(getView(axis), classActivePaneAxis);
        });
        return removeClassList.apply(null, [workspaceElement].concat(slice.call(workspaceClassNames)));
      });
      return this.subscribe(this.maximizePaneDisposable);
    },
    equalizePanes: function() {
      var setFlexScale;
      setFlexScale = function(newValue, base) {
        var child, i, len, ref2, ref3, results;
        if (base == null) {
          base = atom.workspace.getActivePane().getContainer().getRoot();
        }
        base.setFlexScale(newValue);
        ref3 = (ref2 = base.children) != null ? ref2 : [];
        results = [];
        for (i = 0, len = ref3.length; i < len; i++) {
          child = ref3[i];
          results.push(setFlexScale(newValue, child));
        }
        return results;
      };
      return setFlexScale(1);
    },
    registerVimStateCommands: function() {
      var bindToVimState, char, chars, commands, fn1, getEditorState, i, j, len, results;
      commands = {
        'activate-normal-mode': function() {
          return this.activate('normal');
        },
        'activate-linewise-visual-mode': function() {
          return this.activate('visual', 'linewise');
        },
        'activate-characterwise-visual-mode': function() {
          return this.activate('visual', 'characterwise');
        },
        'activate-blockwise-visual-mode': function() {
          return this.activate('visual', 'blockwise');
        },
        'reset-normal-mode': function() {
          return this.resetNormalMode({
            userInvocation: true
          });
        },
        'set-register-name': function() {
          return this.register.setName();
        },
        'set-register-name-to-_': function() {
          return this.register.setName('_');
        },
        'set-register-name-to-*': function() {
          return this.register.setName('*');
        },
        'operator-modifier-characterwise': function() {
          return this.emitDidSetOperatorModifier({
            wise: 'characterwise'
          });
        },
        'operator-modifier-linewise': function() {
          return this.emitDidSetOperatorModifier({
            wise: 'linewise'
          });
        },
        'operator-modifier-occurrence': function() {
          return this.emitDidSetOperatorModifier({
            occurrence: true,
            occurrenceType: 'base'
          });
        },
        'operator-modifier-subword-occurrence': function() {
          return this.emitDidSetOperatorModifier({
            occurrence: true,
            occurrenceType: 'subword'
          });
        },
        'repeat': function() {
          return this.operationStack.runRecorded();
        },
        'repeat-find': function() {
          return this.operationStack.runCurrentFind();
        },
        'repeat-find-reverse': function() {
          return this.operationStack.runCurrentFind({
            reverse: true
          });
        },
        'repeat-search': function() {
          return this.operationStack.runCurrentSearch();
        },
        'repeat-search-reverse': function() {
          return this.operationStack.runCurrentSearch({
            reverse: true
          });
        },
        'set-count-0': function() {
          return this.setCount(0);
        },
        'set-count-1': function() {
          return this.setCount(1);
        },
        'set-count-2': function() {
          return this.setCount(2);
        },
        'set-count-3': function() {
          return this.setCount(3);
        },
        'set-count-4': function() {
          return this.setCount(4);
        },
        'set-count-5': function() {
          return this.setCount(5);
        },
        'set-count-6': function() {
          return this.setCount(6);
        },
        'set-count-7': function() {
          return this.setCount(7);
        },
        'set-count-8': function() {
          return this.setCount(8);
        },
        'set-count-9': function() {
          return this.setCount(9);
        }
      };
      chars = (function() {
        results = [];
        for (i = 32; i <= 126; i++){ results.push(i); }
        return results;
      }).apply(this).map(function(code) {
        return String.fromCharCode(code);
      });
      fn1 = function(char) {
        var charForKeymap;
        charForKeymap = char === ' ' ? 'space' : char;
        return commands["set-input-char-" + charForKeymap] = function() {
          return this.emitDidSetInputChar(char);
        };
      };
      for (j = 0, len = chars.length; j < len; j++) {
        char = chars[j];
        fn1(char);
      }
      getEditorState = this.getEditorState.bind(this);
      bindToVimState = function(oldCommands) {
        var fn, fn2, name, newCommands;
        newCommands = {};
        fn2 = function(fn) {
          return newCommands["vim-mode-plus:" + name] = function(event) {
            var vimState;
            event.stopPropagation();
            if (vimState = getEditorState(this.getModel())) {
              return fn.call(vimState, event);
            }
          };
        };
        for (name in oldCommands) {
          fn = oldCommands[name];
          fn2(fn);
        }
        return newCommands;
      };
      return this.subscribe(atom.commands.add('atom-text-editor:not([mini])', bindToVimState(commands)));
    },
    consumeStatusBar: function(statusBar) {
      var statusBarManager;
      statusBarManager = this.getStatusBarManager();
      statusBarManager.initialize(statusBar);
      statusBarManager.attach();
      return this.subscribe(new Disposable(function() {
        return statusBarManager.detach();
      }));
    },
    consumeDemoMode: function(arg1) {
      var onDidRemoveHover, onDidStart, onDidStop, onWillAddItem;
      onWillAddItem = arg1.onWillAddItem, onDidStart = arg1.onDidStart, onDidStop = arg1.onDidStop, onDidRemoveHover = arg1.onDidRemoveHover;
      return this.subscribe(onDidStart(function() {
        return globalState.set('demoModeIsActive', true);
      }), onDidStop(function() {
        return globalState.set('demoModeIsActive', false);
      }), onDidRemoveHover(this.destroyAllDemoModeFlasheMarkers.bind(this)), onWillAddItem((function(_this) {
        return function(arg2) {
          var commandElement, element, event, item;
          item = arg2.item, event = arg2.event;
          if (event.binding.command.startsWith('vim-mode-plus:')) {
            commandElement = item.getElementsByClassName('command')[0];
            commandElement.textContent = commandElement.textContent.replace(/^vim-mode-plus:/, '');
          }
          element = document.createElement('span');
          element.classList.add('kind', 'pull-right');
          element.textContent = _this.getKindForCommand(event.binding.command);
          return item.appendChild(element);
        };
      })(this)));
    },
    destroyAllDemoModeFlasheMarkers: function() {
      return VimState != null ? VimState.forEach(function(vimState) {
        return vimState.flashManager.destroyDemoModeMarkers();
      }) : void 0;
    },
    getKindForCommand: function(command) {
      var kind, ref2;
      if (command.startsWith('vim-mode-plus')) {
        command = command.replace(/^vim-mode-plus:/, '');
        if (command.startsWith('operator-modifier')) {
          return kind = 'op-modifier';
        } else {
          return (ref2 = Base.getKindForCommandName(command)) != null ? ref2 : 'vmp-other';
        }
      } else {
        return 'non-vmp';
      }
    },
    createVimState: function(editor) {
      var vimState;
      vimState = new VimState(editor, this.getStatusBarManager(), globalState);
      return this.emitter.emit('did-add-vim-state', vimState);
    },
    createVimStateIfNecessary: function(editor) {
      var vimState;
      if (VimState.has(editor)) {
        return;
      }
      vimState = new VimState(editor, this.getStatusBarManager(), globalState);
      return this.emitter.emit('did-add-vim-state', vimState);
    },
    getGlobalState: function() {
      return globalState;
    },
    getEditorState: function(editor) {
      return VimState.getByEditor(editor);
    },
    provideVimModePlus: function() {
      return {
        Base: Base,
        registerCommandFromSpec: Base.registerCommandFromSpec,
        getGlobalState: this.getGlobalState,
        getEditorState: this.getEditorState,
        observeVimStates: this.observeVimStates.bind(this),
        onDidAddVimState: this.onDidAddVimState.bind(this)
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2FydHJlLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSw2SUFBQTtJQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBRUosTUFBNkMsT0FBQSxDQUFRLE1BQVIsQ0FBN0MsRUFBQywyQkFBRCxFQUFhLHFCQUFiLEVBQXNCOztFQUV0QixJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0VBQ1AsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUjs7RUFDZCxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBQ1gsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUNYLE9BQW1ELE9BQUEsQ0FBUSxTQUFSLENBQW5ELEVBQUMsc0NBQUQsRUFBa0IsZ0NBQWxCLEVBQWdDOztFQUVoQyxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsTUFBQSxFQUFRLFFBQVEsQ0FBQyxNQUFqQjtJQUVBLG1CQUFBLEVBQXFCLFNBQUE7NkNBQ25CLElBQUMsQ0FBQSxtQkFBRCxJQUFDLENBQUEsbUJBQW9CLElBQUksQ0FBQyxPQUFBLENBQVEsc0JBQVIsQ0FBRDtJQUROLENBRnJCO0lBS0EsUUFBQSxFQUFVLFNBQUMsS0FBRDtBQUNSLFVBQUE7TUFBQSxJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUVmLE9BQUEsR0FBVSxJQUFDLENBQUEsa0JBQUQsQ0FBQTtNQUNWLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBSSxDQUFDLElBQUwsQ0FBVSxPQUFWLENBQVg7TUFDQSxJQUFDLENBQUEsZ0JBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSx3QkFBRCxDQUFBO01BRUEsUUFBUSxDQUFDLHNCQUFULENBQUE7TUFFQSxJQUFHLElBQUksQ0FBQyxVQUFMLENBQUEs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UUFHQSxjQUFBLEVBQWdCLElBQUMsQ0FBQSxjQUhqQjtRQUlBLGdCQUFBLEVBQWtCLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxJQUFsQixDQUF1QixJQUF2QixDQUpsQjtRQUtBLGdCQUFBLEVBQWtCLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxJQUFsQixDQUF1QixJQUF2QixDQUxsQjs7SUFEa0IsQ0E1UXBCOztBQVhGIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxue0Rpc3Bvc2FibGUsIEVtaXR0ZXIsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxuQmFzZSA9IHJlcXVpcmUgJy4vYmFzZSdcbmdsb2JhbFN0YXRlID0gcmVxdWlyZSAnLi9nbG9iYWwtc3RhdGUnXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5WaW1TdGF0ZSA9IHJlcXVpcmUgJy4vdmltLXN0YXRlJ1xue2ZvckVhY2hQYW5lQXhpcywgYWRkQ2xhc3NMaXN0LCByZW1vdmVDbGFzc0xpc3R9ID0gcmVxdWlyZSAnLi91dGlscydcblxubW9kdWxlLmV4cG9ydHMgPVxuICBjb25maWc6IHNldHRpbmdzLmNvbmZpZ1xuXG4gIGdldFN0YXR1c0Jhck1hbmFnZXI6IC0+XG4gICAgQHN0YXR1c0Jhck1hbmFnZXIgPz0gbmV3IChyZXF1aXJlICcuL3N0YXR1cy1iYXItbWFuYWdlcicpXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuXG4gICAgc2VydmljZSA9IEBwcm92aWRlVmltTW9kZVBsdXMoKVxuICAgIEBzdWJzY3JpYmUoQmFzZS5pbml0KHNlcnZpY2UpKVxuICAgIEByZWdpc3RlckNvbW1hbmRzKClcbiAgICBAcmVnaXN0ZXJWaW1TdGF0ZUNvbW1hbmRzKClcblxuICAgIHNldHRpbmdzLm5vdGlmeURlcHJlY2F0ZWRQYXJhbXMoKVxuXG4gICAgaWYgYXRvbS5pblNwZWNNb2RlKClcbiAgICAgIHNldHRpbmdzLnNldCgnc3RyaWN0QXNzZXJ0aW9uJywgdHJ1ZSlcblxuICAgIGlmIGF0b20uaW5EZXZNb2RlKClcbiAgICAgIGRldmVsb3BlciA9IG5ldyAocmVxdWlyZSAnLi9kZXZlbG9wZXInKVxuICAgICAgQHN1YnNjcmliZShkZXZlbG9wZXIuaW5pdChzZXJ2aWNlKSlcblxuICAgIEBzdWJzY3JpYmUgQG9ic2VydmVWaW1Nb2RlIC0+XG4gICAgICBtZXNzYWdlID0gXCJcIlwiXG4gICAgICAgICMjIE1lc3NhZ2UgYnkgdmltLW1vZGUtcGx1czogdmltLW1vZGUgZGV0ZWN0ZWQhXG4gICAgICAgIFRvIHVzZSB2aW0tbW9kZS1wbHVzLCB5b3UgbXVzdCAqKmRpc2FibGUgdmltLW1vZGUqKiBtYW51YWxseS5cbiAgICAgICAgXCJcIlwiXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhtZXNzYWdlLCBkaXNtaXNzYWJsZTogdHJ1ZSlcblxuICAgIEBzdWJzY3JpYmUgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzIChlZGl0b3IpID0+XG4gICAgICBAY3JlYXRlVmltU3RhdGUoZWRpdG9yKSB1bmxlc3MgZWRpdG9yLmlzTWluaSgpXG4gICAgQHN1YnNjcmliZSBhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtID0+XG4gICAgICBAZGVtYXhpbWl6ZVBhbmUoKVxuXG4gICAgQHN1YnNjcmliZSBhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtIC0+XG4gICAgICBpZiBzZXR0aW5ncy5nZXQoJ2F1dG9tYXRpY2FsbHlFc2NhcGVJbnNlcnRNb2RlT25BY3RpdmVQYW5lSXRlbUNoYW5nZScpXG4gICAgICAgIFZpbVN0YXRlLmZvckVhY2ggKHZpbVN0YXRlKSAtPlxuICAgICAgICAgIHZpbVN0YXRlLmFjdGl2YXRlKCdub3JtYWwnKSBpZiB2aW1TdGF0ZS5tb2RlIGlzICdpbnNlcnQnXG5cbiAgICBAc3Vic2NyaWJlIGF0b20ud29ya3NwYWNlLm9uRGlkU3RvcENoYW5naW5nQWN0aXZlUGFuZUl0ZW0gKGl0ZW0pID0+XG4gICAgICBpZiBhdG9tLndvcmtzcGFjZS5pc1RleHRFZGl0b3IoaXRlbSkgYW5kIG5vdCBpdGVtLmlzTWluaSgpXG4gICAgICAgICMgU3RpbGwgdGhlcmUgaXMgcG9zc2liaWxpdHkgZWRpdG9yIGlzIGRlc3Ryb3llZCBhbmQgZG9uJ3QgaGF2ZSBjb3JyZXNwb25kaW5nXG4gICAgICAgICMgdmltU3RhdGUgIzE5Ni5cbiAgICAgICAgQGdldEVkaXRvclN0YXRlKGl0ZW0pPy5oaWdobGlnaHRTZWFyY2gucmVmcmVzaCgpXG5cbiAgICAjIEBzdWJzY3JpYmUgIGdsb2JhbFN0YXRlLmdldCgnaGlnaGxpZ2h0U2VhcmNoUGF0dGVybicpXG4gICAgIyBSZWZyZXNoIGhpZ2hsaWdodCBiYXNlZCBvbiBnbG9iYWxTdGF0ZS5oaWdobGlnaHRTZWFyY2hQYXR0ZXJuIGNoYW5nZXMuXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgQHN1YnNjcmliZSBnbG9iYWxTdGF0ZS5vbkRpZENoYW5nZSAoe25hbWUsIG5ld1ZhbHVlfSkgLT5cbiAgICAgIGlmIG5hbWUgaXMgJ2hpZ2hsaWdodFNlYXJjaFBhdHRlcm4nXG4gICAgICAgIGlmIG5ld1ZhbHVlXG4gICAgICAgICAgVmltU3RhdGUuZm9yRWFjaCAodmltU3RhdGUpIC0+XG4gICAgICAgICAgICB2aW1TdGF0ZS5oaWdobGlnaHRTZWFyY2gucmVmcmVzaCgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBWaW1TdGF0ZS5mb3JFYWNoICh2aW1TdGF0ZSkgLT5cbiAgICAgICAgICAgICMgYXZvaWQgcG9wdWxhdGUgcHJvcCB1bm5lY2Vzc2FyaWx5IG9uIHZpbVN0YXRlLnJlc2V0IG9uIHN0YXJ0dXBcbiAgICAgICAgICAgIGlmIHZpbVN0YXRlLl9faGlnaGxpZ2h0U2VhcmNoXG4gICAgICAgICAgICAgIHZpbVN0YXRlLmhpZ2hsaWdodFNlYXJjaC5jbGVhck1hcmtlcnMoKVxuXG4gICAgQHN1YnNjcmliZSBzZXR0aW5ncy5vYnNlcnZlICdoaWdobGlnaHRTZWFyY2gnLCAobmV3VmFsdWUpIC0+XG4gICAgICBpZiBuZXdWYWx1ZVxuICAgICAgICAjIFJlLXNldHRpbmcgdmFsdWUgdHJpZ2dlciBoaWdobGlnaHRTZWFyY2ggcmVmcmVzaFxuICAgICAgICBnbG9iYWxTdGF0ZS5zZXQoJ2hpZ2hsaWdodFNlYXJjaFBhdHRlcm4nLCBnbG9iYWxTdGF0ZS5nZXQoJ2xhc3RTZWFyY2hQYXR0ZXJuJykpXG4gICAgICBlbHNlXG4gICAgICAgIGdsb2JhbFN0YXRlLnNldCgnaGlnaGxpZ2h0U2VhcmNoUGF0dGVybicsIG51bGwpXG5cbiAgICBAc3Vic2NyaWJlKHNldHRpbmdzLm9ic2VydmVDb25kaXRpb25hbEtleW1hcHMoKS4uLilcblxuICBvYnNlcnZlVmltTW9kZTogKGZuKSAtPlxuICAgIGZuKCkgaWYgYXRvbS5wYWNrYWdlcy5pc1BhY2thZ2VBY3RpdmUoJ3ZpbS1tb2RlJylcbiAgICBhdG9tLnBhY2thZ2VzLm9uRGlkQWN0aXZhdGVQYWNrYWdlIChwYWNrKSAtPlxuICAgICAgZm4oKSBpZiBwYWNrLm5hbWUgaXMgJ3ZpbS1tb2RlJ1xuXG4gICMgKiBgZm5gIHtGdW5jdGlvbn0gdG8gYmUgY2FsbGVkIHdoZW4gdmltU3RhdGUgaW5zdGFuY2Ugd2FzIGNyZWF0ZWQuXG4gICMgIFVzYWdlOlxuICAjICAgb25EaWRBZGRWaW1TdGF0ZSAodmltU3RhdGUpIC0+IGRvIHNvbWV0aGluZy4uXG4gICMgUmV0dXJucyBhIHtEaXNwb3NhYmxlfSBvbiB3aGljaCBgLmRpc3Bvc2UoKWAgY2FuIGJlIGNhbGxlZCB0byB1bnN1YnNjcmliZS5cbiAgb25EaWRBZGRWaW1TdGF0ZTogKGZuKSAtPiBAZW1pdHRlci5vbignZGlkLWFkZC12aW0tc3RhdGUnLCBmbilcblxuICAjICogYGZuYCB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCB3aXRoIGFsbCBjdXJyZW50IGFuZCBmdXR1cmUgdmltU3RhdGVcbiAgIyAgVXNhZ2U6XG4gICMgICBvYnNlcnZlVmltU3RhdGVzICh2aW1TdGF0ZSkgLT4gZG8gc29tZXRoaW5nLi5cbiAgIyBSZXR1cm5zIGEge0Rpc3Bvc2FibGV9IG9uIHdoaWNoIGAuZGlzcG9zZSgpYCBjYW4gYmUgY2FsbGVkIHRvIHVuc3Vic2NyaWJlLlxuICBvYnNlcnZlVmltU3RhdGVzOiAoZm4pIC0+XG4gICAgVmltU3RhdGU/LmZvckVhY2goZm4pXG4gICAgQG9uRGlkQWRkVmltU3RhdGUoZm4pXG5cbiAgY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9uRm9yRWRpdG9yczogLT5cbiAgICBmb3IgZWRpdG9yIGluIGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKClcbiAgICAgIEBnZXRFZGl0b3JTdGF0ZShlZGl0b3IpLmNsZWFyUGVyc2lzdGVudFNlbGVjdGlvbnMoKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgVmltU3RhdGU/LmZvckVhY2ggKHZpbVN0YXRlKSAtPlxuICAgICAgdmltU3RhdGUuZGVzdHJveSgpXG4gICAgVmltU3RhdGU/LmNsZWFyKClcblxuICBzdWJzY3JpYmU6IChhcmdzLi4uKSAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmFkZChhcmdzLi4uKVxuXG4gIHVuc3Vic2NyaWJlOiAoYXJnKSAtPlxuICAgIEBzdWJzY3JpcHRpb25zLnJlbW92ZShhcmcpXG5cbiAgcmVnaXN0ZXJDb21tYW5kczogLT5cbiAgICBAc3Vic2NyaWJlIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXRleHQtZWRpdG9yOm5vdChbbWluaV0pJyxcbiAgICAgICd2aW0tbW9kZS1wbHVzOmNsZWFyLWhpZ2hsaWdodC1zZWFyY2gnOiAtPiBnbG9iYWxTdGF0ZS5zZXQoJ2hpZ2hsaWdodFNlYXJjaFBhdHRlcm4nLCBudWxsKVxuICAgICAgJ3ZpbS1tb2RlLXBsdXM6dG9nZ2xlLWhpZ2hsaWdodC1zZWFyY2gnOiAtPiBzZXR0aW5ncy50b2dnbGUoJ2hpZ2hsaWdodFNlYXJjaCcpXG4gICAgICAndmltLW1vZGUtcGx1czpjbGVhci1wZXJzaXN0ZW50LXNlbGVjdGlvbic6ID0+IEBjbGVhclBlcnNpc3RlbnRTZWxlY3Rpb25Gb3JFZGl0b3JzKClcblxuICAgIEBzdWJzY3JpYmUgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICd2aW0tbW9kZS1wbHVzOm1heGltaXplLXBhbmUnOiA9PiBAbWF4aW1pemVQYW5lKClcbiAgICAgICd2aW0tbW9kZS1wbHVzOmVxdWFsaXplLXBhbmVzJzogPT4gQGVxdWFsaXplUGFuZXMoKVxuXG4gIGRlbWF4aW1pemVQYW5lOiAtPlxuICAgIGlmIEBtYXhpbWl6ZVBhbmVEaXNwb3NhYmxlP1xuICAgICAgQG1heGltaXplUGFuZURpc3Bvc2FibGUuZGlzcG9zZSgpXG4gICAgICBAdW5zdWJzY3JpYmUoQG1heGltaXplUGFuZURpc3Bvc2FibGUpXG4gICAgICBAbWF4aW1pemVQYW5lRGlzcG9zYWJsZSA9IG51bGxcblxuICBtYXhpbWl6ZVBhbmU6IC0+XG4gICAgaWYgQG1heGltaXplUGFuZURpc3Bvc2FibGU/XG4gICAgICBAZGVtYXhpbWl6ZVBhbmUoKVxuICAgICAgcmV0dXJuXG5cbiAgICBnZXRWaWV3ID0gKG1vZGVsKSAtPiBhdG9tLnZpZXdzLmdldFZpZXcobW9kZWwpXG4gICAgY2xhc3NQYW5lTWF4aW1pemVkID0gJ3ZpbS1tb2RlLXBsdXMtLXBhbmUtbWF4aW1pemVkJ1xuICAgIGNsYXNzSGlkZVRhYkJhciA9ICd2aW0tbW9kZS1wbHVzLS1oaWRlLXRhYi1iYXInXG4gICAgY2xhc3NIaWRlU3RhdHVzQmFyID0gJ3ZpbS1tb2RlLXBsdXMtLWhpZGUtc3RhdHVzLWJhcidcbiAgICBjbGFzc0FjdGl2ZVBhbmVBeGlzID0gJ3ZpbS1tb2RlLXBsdXMtLWFjdGl2ZS1wYW5lLWF4aXMnXG5cbiAgICB3b3Jrc3BhY2VFbGVtZW50ID0gZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcbiAgICBwYW5lRWxlbWVudCA9IGdldFZpZXcoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpKVxuXG4gICAgd29ya3NwYWNlQ2xhc3NOYW1lcyA9IFtjbGFzc1BhbmVNYXhpbWl6ZWRdXG4gICAgd29ya3NwYWNlQ2xhc3NOYW1lcy5wdXNoKGNsYXNzSGlkZVRhYkJhcikgaWYgc2V0dGluZ3MuZ2V0KCdoaWRlVGFiQmFyT25NYXhpbWl6ZVBhbmUnKVxuICAgIHdvcmtzcGFjZUNsYXNzTmFtZXMucHVzaChjbGFzc0hpZGVTdGF0dXNCYXIpIGlmIHNldHRpbmdzLmdldCgnaGlkZVN0YXR1c0Jhck9uTWF4aW1pemVQYW5lJylcblxuICAgIGFkZENsYXNzTGlzdCh3b3Jrc3BhY2VFbGVtZW50LCB3b3Jrc3BhY2VDbGFzc05hbWVzLi4uKVxuXG4gICAgZm9yRWFjaFBhbmVBeGlzIChheGlzKSAtPlxuICAgICAgcGFuZUF4aXNFbGVtZW50ID0gZ2V0VmlldyhheGlzKVxuICAgICAgaWYgcGFuZUF4aXNFbGVtZW50LmNvbnRhaW5zKHBhbmVFbGVtZW50KVxuICAgICAgICBhZGRDbGFzc0xpc3QocGFuZUF4aXNFbGVtZW50LCBjbGFzc0FjdGl2ZVBhbmVBeGlzKVxuXG4gICAgQG1heGltaXplUGFuZURpc3Bvc2FibGUgPSBuZXcgRGlzcG9zYWJsZSAtPlxuICAgICAgZm9yRWFjaFBhbmVBeGlzIChheGlzKSAtPlxuICAgICAgICByZW1vdmVDbGFzc0xpc3QoZ2V0VmlldyhheGlzKSwgY2xhc3NBY3RpdmVQYW5lQXhpcylcbiAgICAgIHJlbW92ZUNsYXNzTGlzdCh3b3Jrc3BhY2VFbGVtZW50LCB3b3Jrc3BhY2VDbGFzc05hbWVzLi4uKVxuXG4gICAgQHN1YnNjcmliZShAbWF4aW1pemVQYW5lRGlzcG9zYWJsZSlcblxuICBlcXVhbGl6ZVBhbmVzOiAtPlxuICAgIHNldEZsZXhTY2FsZSA9IChuZXdWYWx1ZSwgYmFzZSkgLT5cbiAgICAgIGJhc2UgPz0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpLmdldENvbnRhaW5lcigpLmdldFJvb3QoKVxuICAgICAgYmFzZS5zZXRGbGV4U2NhbGUobmV3VmFsdWUpXG4gICAgICBmb3IgY2hpbGQgaW4gYmFzZS5jaGlsZHJlbiA/IFtdXG4gICAgICAgIHNldEZsZXhTY2FsZShuZXdWYWx1ZSwgY2hpbGQpXG5cbiAgICBzZXRGbGV4U2NhbGUoMSlcblxuICByZWdpc3RlclZpbVN0YXRlQ29tbWFuZHM6IC0+XG4gICAgIyBhbGwgY29tbWFuZHMgaGVyZSBpcyBleGVjdXRlZCB3aXRoIGNvbnRleHQgd2hlcmUgJ3RoaXMnIGJvdW5kIHRvICd2aW1TdGF0ZSdcbiAgICBjb21tYW5kcyA9XG4gICAgICAnYWN0aXZhdGUtbm9ybWFsLW1vZGUnOiAtPiBAYWN0aXZhdGUoJ25vcm1hbCcpXG4gICAgICAnYWN0aXZhdGUtbGluZXdpc2UtdmlzdWFsLW1vZGUnOiAtPiBAYWN0aXZhdGUoJ3Zpc3VhbCcsICdsaW5ld2lzZScpXG4gICAgICAnYWN0aXZhdGUtY2hhcmFjdGVyd2lzZS12aXN1YWwtbW9kZSc6IC0+IEBhY3RpdmF0ZSgndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnKVxuICAgICAgJ2FjdGl2YXRlLWJsb2Nrd2lzZS12aXN1YWwtbW9kZSc6IC0+IEBhY3RpdmF0ZSgndmlzdWFsJywgJ2Jsb2Nrd2lzZScpXG4gICAgICAncmVzZXQtbm9ybWFsLW1vZGUnOiAtPiBAcmVzZXROb3JtYWxNb2RlKHVzZXJJbnZvY2F0aW9uOiB0cnVlKVxuICAgICAgJ3NldC1yZWdpc3Rlci1uYW1lJzogLT4gQHJlZ2lzdGVyLnNldE5hbWUoKSAjIFwiXG4gICAgICAnc2V0LXJlZ2lzdGVyLW5hbWUtdG8tXyc6IC0+IEByZWdpc3Rlci5zZXROYW1lKCdfJylcbiAgICAgICdzZXQtcmVnaXN0ZXItbmFtZS10by0qJzogLT4gQHJlZ2lzdGVyLnNldE5hbWUoJyonKVxuICAgICAgJ29wZXJhdG9yLW1vZGlmaWVyLWNoYXJhY3Rlcndpc2UnOiAtPiBAZW1pdERpZFNldE9wZXJhdG9yTW9kaWZpZXIod2lzZTogJ2NoYXJhY3Rlcndpc2UnKVxuICAgICAgJ29wZXJhdG9yLW1vZGlmaWVyLWxpbmV3aXNlJzogLT4gQGVtaXREaWRTZXRPcGVyYXRvck1vZGlmaWVyKHdpc2U6ICdsaW5ld2lzZScpXG4gICAgICAnb3BlcmF0b3ItbW9kaWZpZXItb2NjdXJyZW5jZSc6IC0+IEBlbWl0RGlkU2V0T3BlcmF0b3JNb2RpZmllcihvY2N1cnJlbmNlOiB0cnVlLCBvY2N1cnJlbmNlVHlwZTogJ2Jhc2UnKVxuICAgICAgJ29wZXJhdG9yLW1vZGlmaWVyLXN1YndvcmQtb2NjdXJyZW5jZSc6IC0+IEBlbWl0RGlkU2V0T3BlcmF0b3JNb2RpZmllcihvY2N1cnJlbmNlOiB0cnVlLCBvY2N1cnJlbmNlVHlwZTogJ3N1YndvcmQnKVxuICAgICAgJ3JlcGVhdCc6IC0+IEBvcGVyYXRpb25TdGFjay5ydW5SZWNvcmRlZCgpXG4gICAgICAncmVwZWF0LWZpbmQnOiAtPiBAb3BlcmF0aW9uU3RhY2sucnVuQ3VycmVudEZpbmQoKVxuICAgICAgJ3JlcGVhdC1maW5kLXJldmVyc2UnOiAtPiBAb3BlcmF0aW9uU3RhY2sucnVuQ3VycmVudEZpbmQocmV2ZXJzZTogdHJ1ZSlcbiAgICAgICdyZXBlYXQtc2VhcmNoJzogLT4gQG9wZXJhdGlvblN0YWNrLnJ1bkN1cnJlbnRTZWFyY2goKVxuICAgICAgJ3JlcGVhdC1zZWFyY2gtcmV2ZXJzZSc6IC0+IEBvcGVyYXRpb25TdGFjay5ydW5DdXJyZW50U2VhcmNoKHJldmVyc2U6IHRydWUpXG4gICAgICAnc2V0LWNvdW50LTAnOiAtPiBAc2V0Q291bnQoMClcbiAgICAgICdzZXQtY291bnQtMSc6IC0+IEBzZXRDb3VudCgxKVxuICAgICAgJ3NldC1jb3VudC0yJzogLT4gQHNldENvdW50KDIpXG4gICAgICAnc2V0LWNvdW50LTMnOiAtPiBAc2V0Q291bnQoMylcbiAgICAgICdzZXQtY291bnQtNCc6IC0+IEBzZXRDb3VudCg0KVxuICAgICAgJ3NldC1jb3VudC01JzogLT4gQHNldENvdW50KDUpXG4gICAgICAnc2V0LWNvdW50LTYnOiAtPiBAc2V0Q291bnQoNilcbiAgICAgICdzZXQtY291bnQtNyc6IC0+IEBzZXRDb3VudCg3KVxuICAgICAgJ3NldC1jb3VudC04JzogLT4gQHNldENvdW50KDgpXG4gICAgICAnc2V0LWNvdW50LTknOiAtPiBAc2V0Q291bnQoOSlcblxuICAgIGNoYXJzID0gWzMyLi4xMjZdLm1hcCAoY29kZSkgLT4gU3RyaW5nLmZyb21DaGFyQ29kZShjb2RlKVxuICAgIGZvciBjaGFyIGluIGNoYXJzXG4gICAgICBkbyAoY2hhcikgLT5cbiAgICAgICAgY2hhckZvcktleW1hcCA9IGlmIGNoYXIgaXMgJyAnIHRoZW4gJ3NwYWNlJyBlbHNlIGNoYXJcbiAgICAgICAgY29tbWFuZHNbXCJzZXQtaW5wdXQtY2hhci0je2NoYXJGb3JLZXltYXB9XCJdID0gLT5cbiAgICAgICAgICBAZW1pdERpZFNldElucHV0Q2hhcihjaGFyKVxuXG4gICAgZ2V0RWRpdG9yU3RhdGUgPSBAZ2V0RWRpdG9yU3RhdGUuYmluZCh0aGlzKVxuXG4gICAgYmluZFRvVmltU3RhdGUgPSAob2xkQ29tbWFuZHMpIC0+XG4gICAgICBuZXdDb21tYW5kcyA9IHt9XG4gICAgICBmb3IgbmFtZSwgZm4gb2Ygb2xkQ29tbWFuZHNcbiAgICAgICAgZG8gKGZuKSAtPlxuICAgICAgICAgIG5ld0NvbW1hbmRzW1widmltLW1vZGUtcGx1czoje25hbWV9XCJdID0gKGV2ZW50KSAtPlxuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgIGlmIHZpbVN0YXRlID0gZ2V0RWRpdG9yU3RhdGUoQGdldE1vZGVsKCkpXG4gICAgICAgICAgICAgIGZuLmNhbGwodmltU3RhdGUsIGV2ZW50KVxuICAgICAgbmV3Q29tbWFuZHNcblxuICAgIEBzdWJzY3JpYmUgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3I6bm90KFttaW5pXSknLCBiaW5kVG9WaW1TdGF0ZShjb21tYW5kcykpXG5cbiAgY29uc3VtZVN0YXR1c0JhcjogKHN0YXR1c0JhcikgLT5cbiAgICBzdGF0dXNCYXJNYW5hZ2VyID0gQGdldFN0YXR1c0Jhck1hbmFnZXIoKVxuICAgIHN0YXR1c0Jhck1hbmFnZXIuaW5pdGlhbGl6ZShzdGF0dXNCYXIpXG4gICAgc3RhdHVzQmFyTWFuYWdlci5hdHRhY2goKVxuICAgIEBzdWJzY3JpYmUgbmV3IERpc3Bvc2FibGUgLT5cbiAgICAgIHN0YXR1c0Jhck1hbmFnZXIuZGV0YWNoKClcblxuICBjb25zdW1lRGVtb01vZGU6ICh7b25XaWxsQWRkSXRlbSwgb25EaWRTdGFydCwgb25EaWRTdG9wLCBvbkRpZFJlbW92ZUhvdmVyfSkgLT5cbiAgICBAc3Vic2NyaWJlKFxuICAgICAgb25EaWRTdGFydCgtPiBnbG9iYWxTdGF0ZS5zZXQoJ2RlbW9Nb2RlSXNBY3RpdmUnLCB0cnVlKSlcbiAgICAgIG9uRGlkU3RvcCgtPiBnbG9iYWxTdGF0ZS5zZXQoJ2RlbW9Nb2RlSXNBY3RpdmUnLCBmYWxzZSkpXG4gICAgICBvbkRpZFJlbW92ZUhvdmVyKEBkZXN0cm95QWxsRGVtb01vZGVGbGFzaGVNYXJrZXJzLmJpbmQodGhpcykpXG4gICAgICBvbldpbGxBZGRJdGVtKCh7aXRlbSwgZXZlbnR9KSA9PlxuICAgICAgICBpZiBldmVudC5iaW5kaW5nLmNvbW1hbmQuc3RhcnRzV2l0aCgndmltLW1vZGUtcGx1czonKVxuICAgICAgICAgIGNvbW1hbmRFbGVtZW50ID0gaXRlbS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdjb21tYW5kJylbMF1cbiAgICAgICAgICBjb21tYW5kRWxlbWVudC50ZXh0Q29udGVudCA9IGNvbW1hbmRFbGVtZW50LnRleHRDb250ZW50LnJlcGxhY2UoL152aW0tbW9kZS1wbHVzOi8sICcnKVxuXG4gICAgICAgIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdraW5kJywgJ3B1bGwtcmlnaHQnKVxuICAgICAgICBlbGVtZW50LnRleHRDb250ZW50ID0gQGdldEtpbmRGb3JDb21tYW5kKGV2ZW50LmJpbmRpbmcuY29tbWFuZClcbiAgICAgICAgaXRlbS5hcHBlbmRDaGlsZChlbGVtZW50KVxuICAgICAgKVxuICAgIClcblxuICBkZXN0cm95QWxsRGVtb01vZGVGbGFzaGVNYXJrZXJzOiAtPlxuICAgIFZpbVN0YXRlPy5mb3JFYWNoICh2aW1TdGF0ZSkgLT5cbiAgICAgIHZpbVN0YXRlLmZsYXNoTWFuYWdlci5kZXN0cm95RGVtb01vZGVNYXJrZXJzKClcblxuICBnZXRLaW5kRm9yQ29tbWFuZDogKGNvbW1hbmQpIC0+XG4gICAgaWYgY29tbWFuZC5zdGFydHNXaXRoKCd2aW0tbW9kZS1wbHVzJylcbiAgICAgIGNvbW1hbmQgPSBjb21tYW5kLnJlcGxhY2UoL152aW0tbW9kZS1wbHVzOi8sICcnKVxuICAgICAgaWYgY29tbWFuZC5zdGFydHNXaXRoKCdvcGVyYXRvci1tb2RpZmllcicpXG4gICAgICAgIGtpbmQgPSAnb3AtbW9kaWZpZXInXG4gICAgICBlbHNlXG4gICAgICAgIEJhc2UuZ2V0S2luZEZvckNvbW1hbmROYW1lKGNvbW1hbmQpID8gJ3ZtcC1vdGhlcidcbiAgICBlbHNlXG4gICAgICAnbm9uLXZtcCdcblxuICBjcmVhdGVWaW1TdGF0ZTogKGVkaXRvcikgLT5cbiAgICB2aW1TdGF0ZSA9IG5ldyBWaW1TdGF0ZShlZGl0b3IsIEBnZXRTdGF0dXNCYXJNYW5hZ2VyKCksIGdsb2JhbFN0YXRlKVxuICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1hZGQtdmltLXN0YXRlJywgdmltU3RhdGUpXG5cbiAgY3JlYXRlVmltU3RhdGVJZk5lY2Vzc2FyeTogKGVkaXRvcikgLT5cbiAgICByZXR1cm4gaWYgVmltU3RhdGUuaGFzKGVkaXRvcilcbiAgICB2aW1TdGF0ZSA9IG5ldyBWaW1TdGF0ZShlZGl0b3IsIEBnZXRTdGF0dXNCYXJNYW5hZ2VyKCksIGdsb2JhbFN0YXRlKVxuICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1hZGQtdmltLXN0YXRlJywgdmltU3RhdGUpXG5cbiAgIyBTZXJ2aWNlIEFQSVxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZ2V0R2xvYmFsU3RhdGU6IC0+XG4gICAgZ2xvYmFsU3RhdGVcblxuICBnZXRFZGl0b3JTdGF0ZTogKGVkaXRvcikgLT5cbiAgICBWaW1TdGF0ZS5nZXRCeUVkaXRvcihlZGl0b3IpXG5cbiAgcHJvdmlkZVZpbU1vZGVQbHVzOiAtPlxuICAgIEJhc2U6IEJhc2VcbiAgICByZWdpc3RlckNvbW1hbmRGcm9tU3BlYzogQmFzZS5yZWdpc3RlckNvbW1hbmRGcm9tU3BlY1xuICAgIGdldEdsb2JhbFN0YXRlOiBAZ2V0R2xvYmFsU3RhdGVcbiAgICBnZXRFZGl0b3JTdGF0ZTogQGdldEVkaXRvclN0YXRlXG4gICAgb2JzZXJ2ZVZpbVN0YXRlczogQG9ic2VydmVWaW1TdGF0ZXMuYmluZCh0aGlzKVxuICAgIG9uRGlkQWRkVmltU3RhdGU6IEBvbkRpZEFkZFZpbVN0YXRlLmJpbmQodGhpcylcbiJdfQ==
