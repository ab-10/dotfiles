(function() {
  var BlockwiseSelection, CompositeDisposable, Delegato, Disposable, Emitter, LazyLoadedLibs, Range, VimState, _, getVisibleEditors, haveSomeNonEmptySelection, jQuery, lazyRequire, matchScopes, ref, ref1, semver, settings, swrap, translatePointAndClip,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  semver = require('semver');

  Delegato = require('delegato');

  jQuery = null;

  _ = require('underscore-plus');

  ref = require('atom'), Emitter = ref.Emitter, Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable, Range = ref.Range;

  settings = require('./settings');

  ref1 = require('./utils'), getVisibleEditors = ref1.getVisibleEditors, matchScopes = ref1.matchScopes, translatePointAndClip = ref1.translatePointAndClip, haveSomeNonEmptySelection = ref1.haveSomeNonEmptySelection;

  swrap = require('./selection-wrapper');

  LazyLoadedLibs = {};

  BlockwiseSelection = null;

  lazyRequire = function(file) {
    if (!(file in LazyLoadedLibs)) {
      LazyLoadedLibs[file] = require(file);
    }
    return LazyLoadedLibs[file];
  };

  module.exports = VimState = (function() {
    var fileToLoad, propName, ref2;

    VimState.vimStatesByEditor = new Map;

    VimState.getByEditor = function(editor) {
      return this.vimStatesByEditor.get(editor);
    };

    VimState.has = function(editor) {
      return this.vimStatesByEditor.has(editor);
    };

    VimState["delete"] = function(editor) {
      return this.vimStatesByEditor["delete"](editor);
    };

    VimState.forEach = function(fn) {
      return this.vimStatesByEditor.forEach(fn);
    };

    VimState.clear = function() {
      return this.vimStatesByEditor.clear();
    };

    Delegato.includeInto(VimState);

    VimState.delegatesProperty('mode', 'submode', {
      toProperty: 'modeManager'
    });

    VimState.delegatesMethods('isMode', 'activate', {
      toProperty: 'modeManager'
    });

    VimState.delegatesMethods('flash', 'flashScreenRange', {
      toProperty: 'flashManager'
    });

    VimState.delegatesMethods('subscribe', 'getCount', 'setCount', 'hasCount', 'addToClassList', {
      toProperty: 'operationStack'
    });

    VimState.defineLazyProperty = function(name, fileToLoad) {
      return Object.defineProperty(this.prototype, name, {
        get: function() {
          var name1;
          return this[name1 = "__" + name] != null ? this[name1] : this[name1] = new (lazyRequire(fileToLoad))(this);
        }
      });
    };

    VimState.lazyProperties = {
      modeManager: './mode-manager',
      mark: './mark-manager',
      register: './register-manager',
      hover: './hover-manager',
      hoverSearchCounter: './hover-manager',
      searchHistory: './search-history-manager',
      highlightSearch: './highlight-search-manager',
      persistentSelection: './persistent-selection-manager',
      occurrenceManager: './occurrence-manager',
      mutationManager: './mutation-manager',
      flashManager: './flash-manager',
      searchInput: './search-input',
      operationStack: './operation-stack',
      cursorStyleManager: './cursor-style-manager'
    };

    ref2 = VimState.lazyProperties;
    for (propName in ref2) {
      fileToLoad = ref2[propName];
      VimState.defineLazyProperty(propName, fileToLoad);
    }

    function VimState(editor1, statusBarManager, globalState) {
      var refreshHighlightSearch;
      this.editor = editor1;
      this.statusBarManager = statusBarManager;
      this.globalState = globalState;
      this.destroy = bind(this.destroy, this);
      this.editorElement = this.editor.element;
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.previousSelection = {};
      this.observeSelections();
      refreshHighlightSearch = (function(_this) {
        return function() {
          return _this.highlightSearch.refresh();
        };
      })(this);
      this.subscriptions.add(this.editor.onDidStopChanging(refreshHighlightSearch));
      this.editorElement.classList.add('vim-mode-plus');
      if (this.getConfig('startInInsertMode') || matchScopes(this.editorElement, this.getConfig('startInInsertModeScopes'))) {
        this.activate('insert');
      } else {
        this.activate('normal');
      }
      this.editor.onDidDestroy(this.destroy);
      this.constructor.vimStatesByEditor.set(this.editor, this);
    }

    VimState.prototype.getConfig = function(param) {
      return settings.get(param);
    };

    VimState.prototype.getBlockwiseSelections = function() {
      if (BlockwiseSelection == null) {
        BlockwiseSelection = require('./blockwise-selection');
      }
      return BlockwiseSelection.getSelections(this.editor);
    };

    VimState.prototype.getLastBlockwiseSelection = function() {
      if (BlockwiseSelection == null) {
        BlockwiseSelection = require('./blockwise-selection');
      }
      return BlockwiseSelection.getLastSelection(this.editor);
    };

    VimState.prototype.getBlockwiseSelectionsOrderedByBufferPosition = function() {
      if (BlockwiseSelection == null) {
        BlockwiseSelection = require('./blockwise-selection');
      }
      return BlockwiseSelection.getSelectionsOrderedByBufferPosition(this.editor);
    };

    VimState.prototype.clearBlockwiseSelections = function() {
      if (BlockwiseSelection == null) {
        BlockwiseSelection = require('./blockwise-selection');
      }
      return BlockwiseSelection.clearSelections(this.editor);
    };

    VimState.prototype.swapClassName = function() {
      var classNames, oldMode, ref3;
      classNames = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      oldMode = this.mode;
      this.editorElement.classList.remove('vim-mode-plus', oldMode + "-mode");
      (ref3 = this.editorElement.classList).add.apply(ref3, classNames);
      return new Disposable((function(_this) {
        return function() {
          var classToAdd, ref4, ref5;
          (ref4 = _this.editorElement.classList).remove.apply(ref4, classNames);
          classToAdd = ['vim-mode-plus', 'is-focused'];
          if (_this.mode === oldMode) {
            classToAdd.push(oldMode + "-mode");
          }
          return (ref5 = _this.editorElement.classList).add.apply(ref5, classToAdd);
        };
      })(this));
    };

    VimState.prototype.onDidChangeSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidChange(fn));
    };

    VimState.prototype.onDidConfirmSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidConfirm(fn));
    };

    VimState.prototype.onDidCancelSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidCancel(fn));
    };

    VimState.prototype.onDidCommandSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidCommand(fn));
    };

    VimState.prototype.onDidSetTarget = function(fn) {
      return this.subscribe(this.emitter.on('did-set-target', fn));
    };

    VimState.prototype.emitDidSetTarget = function(operator) {
      return this.emitter.emit('did-set-target', operator);
    };

    VimState.prototype.onWillSelectTarget = function(fn) {
      return this.subscribe(this.emitter.on('will-select-target', fn));
    };

    VimState.prototype.emitWillSelectTarget = function() {
      return this.emitter.emit('will-select-target');
    };

    VimState.prototype.onDidSelectTarget = function(fn) {
      return this.subscribe(this.emitter.on('did-select-target', fn));
    };

    VimState.prototype.emitDidSelectTarget = function() {
      return this.emitter.emit('did-select-target');
    };

    VimState.prototype.onDidFailSelectTarget = function(fn) {
      return this.subscribe(this.emitter.on('did-fail-select-target', fn));
    };

    VimState.prototype.emitDidFailSelectTarget = function() {
      return this.emitter.emit('did-fail-select-target');
    };

    VimState.prototype.onWillFinishMutation = function(fn) {
      return this.subscribe(this.emitter.on('on-will-finish-mutation', fn));
    };

    VimState.prototype.emitWillFinishMutation = function() {
      return this.emitter.emit('on-will-finish-mutation');
    };

    VimState.prototype.onDidFinishMutation = function(fn) {
      return this.subscribe(this.emitter.on('on-did-finish-mutation', fn));
    };

    VimState.prototype.emitDidFinishMutation = function() {
      return this.emitter.emit('on-did-finish-mutation');
    };

    VimState.prototype.onDidSetOperatorModifier = function(fn) {
      return this.subscribe(this.emitter.on('did-set-operator-modifier', fn));
    };

    VimState.prototype.emitDidSetOperatorModifier = function(options) {
      return this.emitter.emit('did-set-operator-modifier', options);
    };

    VimState.prototype.onDidFinishOperation = function(fn) {
      return this.subscribe(this.emitter.on('did-finish-operation', fn));
    };

    VimState.prototype.emitDidFinishOperation = function() {
      return this.emitter.emit('did-finish-operation');
    };

    VimState.prototype.onDidResetOperationStack = function(fn) {
      return this.subscribe(this.emitter.on('did-reset-operation-stack', fn));
    };

    VimState.prototype.emitDidResetOperationStack = function() {
      return this.emitter.emit('did-reset-operation-stack');
    };

    VimState.prototype.onDidConfirmSelectList = function(fn) {
      return this.subscribe(this.emitter.on('did-confirm-select-list', fn));
    };

    VimState.prototype.onDidCancelSelectList = function(fn) {
      return this.subscribe(this.emitter.on('did-cancel-select-list', fn));
    };

    VimState.prototype.onWillActivateMode = function(fn) {
      return this.subscribe(this.modeManager.onWillActivateMode(fn));
    };

    VimState.prototype.onDidActivateMode = function(fn) {
      return this.subscribe(this.modeManager.onDidActivateMode(fn));
    };

    VimState.prototype.onWillDeactivateMode = function(fn) {
      return this.subscribe(this.modeManager.onWillDeactivateMode(fn));
    };

    VimState.prototype.preemptWillDeactivateMode = function(fn) {
      return this.subscribe(this.modeManager.preemptWillDeactivateMode(fn));
    };

    VimState.prototype.onDidDeactivateMode = function(fn) {
      return this.subscribe(this.modeManager.onDidDeactivateMode(fn));
    };

    VimState.prototype.onDidFailToPushToOperationStack = function(fn) {
      return this.emitter.on('did-fail-to-push-to-operation-stack', fn);
    };

    VimState.prototype.emitDidFailToPushToOperationStack = function() {
      return this.emitter.emit('did-fail-to-push-to-operation-stack');
    };

    VimState.prototype.onDidDestroy = function(fn) {
      return this.emitter.on('did-destroy', fn);
    };

    VimState.prototype.onDidSetMark = function(fn) {
      return this.emitter.on('did-set-mark', fn);
    };

    VimState.prototype.onDidSetInputChar = function(fn) {
      return this.emitter.on('did-set-input-char', fn);
    };

    VimState.prototype.emitDidSetInputChar = function(char) {
      return this.emitter.emit('did-set-input-char', char);
    };

    VimState.prototype.isAlive = function() {
      return this.constructor.has(this.editor);
    };

    VimState.prototype.destroy = function() {
      var ref3, ref4;
      if (!this.isAlive()) {
        return;
      }
      this.constructor["delete"](this.editor);
      if (BlockwiseSelection == null) {
        BlockwiseSelection = require('./blockwise-selection');
      }
      BlockwiseSelection.clearSelections(this.editor);
      this.subscriptions.dispose();
      if (this.editor.isAlive()) {
        this.resetNormalMode();
        this.reset();
        if ((ref3 = this.editorElement.component) != null) {
          ref3.setInputEnabled(true);
        }
        this.editorElement.classList.remove('vim-mode-plus', 'normal-mode');
      }
      ref4 = {}, this.hover = ref4.hover, this.hoverSearchCounter = ref4.hoverSearchCounter, this.operationStack = ref4.operationStack, this.searchHistory = ref4.searchHistory, this.cursorStyleManager = ref4.cursorStyleManager, this.modeManager = ref4.modeManager, this.register = ref4.register, this.editor = ref4.editor, this.editorElement = ref4.editorElement, this.subscriptions = ref4.subscriptions, this.occurrenceManager = ref4.occurrenceManager, this.previousSelection = ref4.previousSelection, this.persistentSelection = ref4.persistentSelection;
      return this.emitter.emit('did-destroy');
    };

    VimState.prototype.checkSelection = function(event) {
      var $selection, i, len, ref3, ref4, wise;
      if (atom.workspace.getActiveTextEditor() !== this.editor) {
        return;
      }
      if ((this.__operationStack != null) && this.operationStack.isProcessing()) {
        return;
      }
      if (this.mode === 'insert') {
        return;
      }
      if (this.editorElement !== ((ref3 = event.target) != null ? typeof ref3.closest === "function" ? ref3.closest('atom-text-editor') : void 0 : void 0)) {
        return;
      }
      if (event.type.startsWith('vim-mode-plus')) {
        return;
      }
      if (haveSomeNonEmptySelection(this.editor)) {
        this.editorElement.component.updateSync();
        wise = swrap.detectWise(this.editor);
        if (this.isMode('visual', wise)) {
          ref4 = swrap.getSelections(this.editor);
          for (i = 0, len = ref4.length; i < len; i++) {
            $selection = ref4[i];
            $selection.saveProperties();
          }
          return this.updateCursorsVisibility();
        } else {
          return this.activate('visual', wise);
        }
      } else {
        if (this.mode === 'visual') {
          return this.activate('normal');
        }
      }
    };

    VimState.prototype.observeSelections = function() {
      var checkSelection;
      checkSelection = this.checkSelection.bind(this);
      this.editorElement.addEventListener('mouseup', checkSelection);
      this.subscriptions.add(new Disposable((function(_this) {
        return function() {
          return _this.editorElement.removeEventListener('mouseup', checkSelection);
        };
      })(this)));
      this.subscriptions.add(atom.commands.onDidDispatch(checkSelection));
      this.editorElement.addEventListener('focus', checkSelection);
      return this.subscriptions.add(new Disposable((function(_this) {
        return function() {
          return _this.editorElement.removeEventListener('focus', checkSelection);
        };
      })(this)));
    };

    VimState.prototype.clearSelections = function() {
      return this.editor.setCursorBufferPosition(this.editor.getCursorBufferPosition());
    };

    VimState.prototype.resetNormalMode = function(arg) {
      var userInvocation;
      userInvocation = (arg != null ? arg : {}).userInvocation;
      if (BlockwiseSelection == null) {
        BlockwiseSelection = require('./blockwise-selection');
      }
      BlockwiseSelection.clearSelections(this.editor);
      if (userInvocation != null ? userInvocation : false) {
        switch (false) {
          case !this.editor.hasMultipleCursors():
            this.clearSelections();
            break;
          case !(this.hasPersistentSelections() && this.getConfig('clearPersistentSelectionOnResetNormalMode')):
            this.clearPersistentSelections();
            break;
          case !this.occurrenceManager.hasPatterns():
            this.occurrenceManager.resetPatterns();
        }
        if (this.getConfig('clearHighlightSearchOnResetNormalMode')) {
          this.globalState.set('highlightSearchPattern', null);
        }
      } else {
        this.clearSelections();
      }
      return this.activate('normal');
    };

    VimState.prototype.init = function() {
      return this.saveOriginalCursorPosition();
    };

    VimState.prototype.reset = function() {
      if (this.__register != null) {
        this.register.reset();
      }
      if (this.__searchHistory != null) {
        this.searchHistory.reset();
      }
      if (this.__hover != null) {
        this.hover.reset();
      }
      if (this.__operationStack != null) {
        this.operationStack.reset();
      }
      if (this.__mutationManager != null) {
        return this.mutationManager.reset();
      }
    };

    VimState.prototype.isVisible = function() {
      var ref3;
      return ref3 = this.editor, indexOf.call(getVisibleEditors(), ref3) >= 0;
    };

    VimState.prototype.updateCursorsVisibility = function() {
      return this.cursorStyleManager.refresh();
    };

    VimState.prototype.updatePreviousSelection = function() {
      var end, head, properties, ref3, ref4, ref5, start, tail;
      if (this.isMode('visual', 'blockwise')) {
        properties = (ref3 = this.getLastBlockwiseSelection()) != null ? ref3.getProperties() : void 0;
      } else {
        properties = swrap(this.editor.getLastSelection()).getProperties();
      }
      if (!properties) {
        return;
      }
      head = properties.head, tail = properties.tail;
      if (head.isGreaterThanOrEqual(tail)) {
        ref4 = [tail, head], start = ref4[0], end = ref4[1];
        head = end = translatePointAndClip(this.editor, end, 'forward');
      } else {
        ref5 = [head, tail], start = ref5[0], end = ref5[1];
        tail = end = translatePointAndClip(this.editor, end, 'forward');
      }
      this.mark.set('<', start);
      this.mark.set('>', end);
      return this.previousSelection = {
        properties: {
          head: head,
          tail: tail
        },
        submode: this.submode
      };
    };

    VimState.prototype.hasPersistentSelections = function() {
      return this.persistentSelection.hasMarkers();
    };

    VimState.prototype.getPersistentSelectionBufferRanges = function() {
      return this.persistentSelection.getMarkerBufferRanges();
    };

    VimState.prototype.clearPersistentSelections = function() {
      return this.persistentSelection.clearMarkers();
    };

    VimState.prototype.scrollAnimationEffect = null;

    VimState.prototype.requestScrollAnimation = function(from, to, options) {
      if (jQuery == null) {
        jQuery = require('atom-space-pen-views').jQuery;
      }
      return this.scrollAnimationEffect = jQuery(from).animate(to, options);
    };

    VimState.prototype.finishScrollAnimation = function() {
      var ref3;
      if ((ref3 = this.scrollAnimationEffect) != null) {
        ref3.finish();
      }
      return this.scrollAnimationEffect = null;
    };

    VimState.prototype.saveOriginalCursorPosition = function() {
      var point, ref3, selection;
      this.originalCursorPosition = null;
      if ((ref3 = this.originalCursorPositionByMarker) != null) {
        ref3.destroy();
      }
      if (this.mode === 'visual') {
        selection = this.editor.getLastSelection();
        point = swrap(selection).getBufferPositionFor('head', {
          from: ['property', 'selection']
        });
      } else {
        point = this.editor.getCursorBufferPosition();
      }
      this.originalCursorPosition = point;
      return this.originalCursorPositionByMarker = this.editor.markBufferPosition(point, {
        invalidate: 'never'
      });
    };

    VimState.prototype.restoreOriginalCursorPosition = function() {
      return this.editor.setCursorBufferPosition(this.getOriginalCursorPosition());
    };

    VimState.prototype.getOriginalCursorPosition = function() {
      return this.originalCursorPosition;
    };

    VimState.prototype.getOriginalCursorPositionByMarker = function() {
      return this.originalCursorPositionByMarker.getStartBufferPosition();
    };

    return VimState;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2FydHJlLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3ZpbS1zdGF0ZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHFQQUFBO0lBQUE7Ozs7RUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7O0VBQ1QsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztFQUNYLE1BQUEsR0FBUzs7RUFFVCxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BQW9ELE9BQUEsQ0FBUSxNQUFSLENBQXBELEVBQUMscUJBQUQsRUFBVSwyQkFBVixFQUFzQiw2Q0FBdEIsRUFBMkM7O0VBRTNDLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUjs7RUFDWCxPQUFxRixPQUFBLENBQVEsU0FBUixDQUFyRixFQUFDLDBDQUFELEVBQW9CLDhCQUFwQixFQUFpQyxrREFBakMsRUFBd0Q7O0VBQ3hELEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVI7O0VBRVIsY0FBQSxHQUFpQjs7RUFDakIsa0JBQUEsR0FBcUI7O0VBRXJCLFdBQUEsR0FBYyxTQUFDLElBQUQ7SUFDWixJQUFBLENBQUEsQ0FBTyxJQUFBLElBQVEsY0FBZixDQUFBO01BT0UsY0FBZSxDQUFBLElBQUEsQ0FBZixHQUF1QixPQUFBLENBQVEsSUFBUixFQVB6Qjs7V0FRQSxjQUFlLENBQUEsSUFBQTtFQVRIOztFQVdkLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixRQUFBOztJQUFBLFFBQUMsQ0FBQSxpQkFBRCxHQUFvQixJQUFJOztJQUV4QixRQUFDLENBQUEsV0FBRCxHQUFjLFNBQUMsTUFBRDthQUFZLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxHQUFuQixDQUF1QixNQUF2QjtJQUFaOztJQUNkLFFBQUMsQ0FBQSxHQUFELEdBQU0sU0FBQyxNQUFEO2FBQVksSUFBQyxDQUFBLGlCQUFpQixDQUFDLEdBQW5CLENB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QUFBLEVBQU0sQ0FBQyxVQUFELEVBQWEsV0FBYixDQUFOO1NBQTlDLEVBRlY7T0FBQSxNQUFBO1FBSUUsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBQSxFQUpWOztNQUtBLElBQUMsQ0FBQSxzQkFBRCxHQUEwQjthQUMxQixJQUFDLENBQUEsOEJBQUQsR0FBa0MsSUFBQyxDQUFBLE1BQU0sQ0FBQyxrQkFBUixDQUEyQixLQUEzQixFQUFrQztRQUFBLFVBQUEsRUFBWSxPQUFaO09BQWxDO0lBVlI7O3VCQVk1Qiw2QkFBQSxHQUErQixTQUFBO2FBQzdCLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBZ0MsSUFBQyxDQUFBLHlCQUFELENBQUEsQ0FBaEM7SUFENkI7O3VCQUcvQix5QkFBQSxHQUEyQixTQUFBO2FBQ3pCLElBQUMsQ0FBQTtJQUR3Qjs7dUJBRzNCLGlDQUFBLEdBQW1DLFNBQUE7YUFDakMsSUFBQyxDQUFBLDhCQUE4QixDQUFDLHNCQUFoQyxDQUFBO0lBRGlDOzs7OztBQW5XckMiLCJzb3VyY2VzQ29udGVudCI6WyJzZW12ZXIgPSByZXF1aXJlICdzZW12ZXInXG5EZWxlZ2F0byA9IHJlcXVpcmUgJ2RlbGVnYXRvJ1xualF1ZXJ5ID0gbnVsbFxuXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue0VtaXR0ZXIsIERpc3Bvc2FibGUsIENvbXBvc2l0ZURpc3Bvc2FibGUsIFJhbmdlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbnNldHRpbmdzID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcbntnZXRWaXNpYmxlRWRpdG9ycywgbWF0Y2hTY29wZXMsIHRyYW5zbGF0ZVBvaW50QW5kQ2xpcCwgaGF2ZVNvbWVOb25FbXB0eVNlbGVjdGlvbn0gPSByZXF1aXJlICcuL3V0aWxzJ1xuc3dyYXAgPSByZXF1aXJlICcuL3NlbGVjdGlvbi13cmFwcGVyJ1xuXG5MYXp5TG9hZGVkTGlicyA9IHt9XG5CbG9ja3dpc2VTZWxlY3Rpb24gPSBudWxsXG5cbmxhenlSZXF1aXJlID0gKGZpbGUpIC0+XG4gIHVubGVzcyBmaWxlIG9mIExhenlMb2FkZWRMaWJzXG5cbiAgICAjIGlmIGF0b20uaW5EZXZNb2RlKClcbiAgICAjICAgY29uc29sZS5sb2cgXCIjIGxhenktcmVxdWlyZTogI3tmaWxlfVwiXG4gICAgIyAgIGNvbnNvbGUudHJhY2UoKVxuICAgICMgICBjb25zb2xlLmxvZyAnLS0tLS0tLS0tLSdcblxuICAgIExhenlMb2FkZWRMaWJzW2ZpbGVdID0gcmVxdWlyZShmaWxlKVxuICBMYXp5TG9hZGVkTGlic1tmaWxlXVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBWaW1TdGF0ZVxuICBAdmltU3RhdGVzQnlFZGl0b3I6IG5ldyBNYXBcblxuICBAZ2V0QnlFZGl0b3I6IChlZGl0b3IpIC0+IEB2aW1TdGF0ZXNCeUVkaXRvci5nZXQoZWRpdG9yKVxuICBAaGFzOiAoZWRpdG9yKSAtPiBAdmltU3RhdGVzQnlFZGl0b3IuaGFzKGVkaXRvcilcbiAgQGRlbGV0ZTogKGVkaXRvcikgLT4gQHZpbVN0YXRlc0J5RWRpdG9yLmRlbGV0ZShlZGl0b3IpXG4gIEBmb3JFYWNoOiAoZm4pIC0+IEB2aW1TdGF0ZXNCeUVkaXRvci5mb3JFYWNoKGZuKVxuICBAY2xlYXI6IC0+IEB2aW1TdGF0ZXNCeUVkaXRvci5jbGVhcigpXG5cbiAgRGVsZWdhdG8uaW5jbHVkZUludG8odGhpcylcbiAgQGRlbGVnYXRlc1Byb3BlcnR5KCdtb2RlJywgJ3N1Ym1vZGUnLCB0b1Byb3BlcnR5OiAnbW9kZU1hbmFnZXInKVxuICBAZGVsZWdhdGVzTWV0aG9kcygnaXNNb2RlJywgJ2FjdGl2YXRlJywgdG9Qcm9wZXJ0eTogJ21vZGVNYW5hZ2VyJylcbiAgQGRlbGVnYXRlc01ldGhvZHMoJ2ZsYXNoJywgJ2ZsYXNoU2NyZWVuUmFuZ2UnLCB0b1Byb3BlcnR5OiAnZmxhc2hNYW5hZ2VyJylcbiAgQGRlbGVnYXRlc01ldGhvZHMoJ3N1YnNjcmliZScsICdnZXRDb3VudCcsICdzZXRDb3VudCcsICdoYXNDb3VudCcsICdhZGRUb0NsYXNzTGlzdCcsIHRvUHJvcGVydHk6ICdvcGVyYXRpb25TdGFjaycpXG5cbiAgQGRlZmluZUxhenlQcm9wZXJ0eTogKG5hbWUsIGZpbGVUb0xvYWQpIC0+XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5IEBwcm90b3R5cGUsIG5hbWUsXG4gICAgICBnZXQ6IC0+IHRoaXNbXCJfXyN7bmFtZX1cIl0gPz0gbmV3IChsYXp5UmVxdWlyZShmaWxlVG9Mb2FkKSkodGhpcylcblxuICBAbGF6eVByb3BlcnRpZXMgPVxuICAgIG1vZGVNYW5hZ2VyOiAnLi9tb2RlLW1hbmFnZXInXG4gICAgbWFyazogJy4vbWFyay1tYW5hZ2VyJ1xuICAgIHJlZ2lzdGVyOiAnLi9yZWdpc3Rlci1tYW5hZ2VyJ1xuICAgIGhvdmVyOiAnLi9ob3Zlci1tYW5hZ2VyJ1xuICAgIGhvdmVyU2VhcmNoQ291bnRlcjogJy4vaG92ZXItbWFuYWdlcidcbiAgICBzZWFyY2hIaXN0b3J5OiAnLi9zZWFyY2gtaGlzdG9yeS1tYW5hZ2VyJ1xuICAgIGhpZ2hsaWdodFNlYXJjaDogJy4vaGlnaGxpZ2h0LXNlYXJjaC1tYW5hZ2VyJ1xuICAgIHBlcnNpc3RlbnRTZWxlY3Rpb246ICcuL3BlcnNpc3RlbnQtc2VsZWN0aW9uLW1hbmFnZXInXG4gICAgb2NjdXJyZW5jZU1hbmFnZXI6ICcuL29jY3VycmVuY2UtbWFuYWdlcidcbiAgICBtdXRhdGlvbk1hbmFnZXI6ICcuL211dGF0aW9uLW1hbmFnZXInXG4gICAgZmxhc2hNYW5hZ2VyOiAnLi9mbGFzaC1tYW5hZ2VyJ1xuICAgIHNlYXJjaElucHV0OiAnLi9zZWFyY2gtaW5wdXQnXG4gICAgb3BlcmF0aW9uU3RhY2s6ICcuL29wZXJhdGlvbi1zdGFjaydcbiAgICBjdXJzb3JTdHlsZU1hbmFnZXI6ICcuL2N1cnNvci1zdHlsZS1tYW5hZ2VyJ1xuXG4gIGZvciBwcm9wTmFtZSwgZmlsZVRvTG9hZCBvZiBAbGF6eVByb3BlcnRpZXNcbiAgICBAZGVmaW5lTGF6eVByb3BlcnR5KHByb3BOYW1lLCBmaWxlVG9Mb2FkKVxuXG4gIGNvbnN0cnVjdG9yOiAoQGVkaXRvciwgQHN0YXR1c0Jhck1hbmFnZXIsIEBnbG9iYWxTdGF0ZSkgLT5cbiAgICBAZWRpdG9yRWxlbWVudCA9IEBlZGl0b3IuZWxlbWVudFxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHByZXZpb3VzU2VsZWN0aW9uID0ge31cbiAgICBAb2JzZXJ2ZVNlbGVjdGlvbnMoKVxuXG4gICAgcmVmcmVzaEhpZ2hsaWdodFNlYXJjaCA9ID0+XG4gICAgICBAaGlnaGxpZ2h0U2VhcmNoLnJlZnJlc2goKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLm9uRGlkU3RvcENoYW5naW5nKHJlZnJlc2hIaWdobGlnaHRTZWFyY2gpXG5cbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKCd2aW0tbW9kZS1wbHVzJylcbiAgICBpZiBAZ2V0Q29uZmlnKCdzdGFydEluSW5zZXJ0TW9kZScpIG9yIG1hdGNoU2NvcGVzKEBlZGl0b3JFbGVtZW50LCBAZ2V0Q29uZmlnKCdzdGFydEluSW5zZXJ0TW9kZVNjb3BlcycpKVxuICAgICAgQGFjdGl2YXRlKCdpbnNlcnQnKVxuICAgIGVsc2VcbiAgICAgIEBhY3RpdmF0ZSgnbm9ybWFsJylcblxuICAgIEBlZGl0b3Iub25EaWREZXN0cm95KEBkZXN0cm95KVxuICAgIEBjb25zdHJ1Y3Rvci52aW1TdGF0ZXNCeUVkaXRvci5zZXQoQGVkaXRvciwgdGhpcylcblxuICBnZXRDb25maWc6IChwYXJhbSkgLT5cbiAgICBzZXR0aW5ncy5nZXQocGFyYW0pXG5cbiAgIyBCbG9ja3dpc2VTZWxlY3Rpb25zXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBnZXRCbG9ja3dpc2VTZWxlY3Rpb25zOiAtPlxuICAgIEJsb2Nrd2lzZVNlbGVjdGlvbiA/PSByZXF1aXJlICcuL2Jsb2Nrd2lzZS1zZWxlY3Rpb24nXG4gICAgQmxvY2t3aXNlU2VsZWN0aW9uLmdldFNlbGVjdGlvbnMoQGVkaXRvcilcblxuICBnZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uOiAtPlxuICAgIEJsb2Nrd2lzZVNlbGVjdGlvbiA/PSByZXF1aXJlICcuL2Jsb2Nrd2lzZS1zZWxlY3Rpb24nXG4gICAgQmxvY2t3aXNlU2VsZWN0aW9uLmdldExhc3RTZWxlY3Rpb24oQGVkaXRvcilcblxuICBnZXRCbG9ja3dpc2VTZWxlY3Rpb25zT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb246IC0+XG4gICAgQmxvY2t3aXNlU2VsZWN0aW9uID89IHJlcXVpcmUgJy4vYmxvY2t3aXNlLXNlbGVjdGlvbidcbiAgICBCbG9ja3dpc2VTZWxlY3Rpb24uZ2V0U2VsZWN0aW9uc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uKEBlZGl0b3IpXG5cbiAgY2xlYXJCbG9ja3dpc2VTZWxlY3Rpb25zOiAtPlxuICAgIEJsb2Nrd2lzZVNlbGVjdGlvbiA/PSByZXF1aXJlICcuL2Jsb2Nrd2lzZS1zZWxlY3Rpb24nXG4gICAgQmxvY2t3aXNlU2VsZWN0aW9uLmNsZWFyU2VsZWN0aW9ucyhAZWRpdG9yKVxuXG4gICMgT3RoZXJcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgRklYTUU6IEkgd2FudCB0byByZW1vdmUgdGhpcyBkZW5nZXJpb3VzIGFwcHJvYWNoLCBidXQgSSBjb3VsZG4ndCBmaW5kIHRoZSBiZXR0ZXIgd2F5LlxuICBzd2FwQ2xhc3NOYW1lOiAoY2xhc3NOYW1lcy4uLikgLT5cbiAgICBvbGRNb2RlID0gQG1vZGVcbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCd2aW0tbW9kZS1wbHVzJywgb2xkTW9kZSArIFwiLW1vZGVcIilcbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZXMuLi4pXG5cbiAgICBuZXcgRGlzcG9zYWJsZSA9PlxuICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWVzLi4uKVxuICAgICAgY2xhc3NUb0FkZCA9IFsndmltLW1vZGUtcGx1cycsICdpcy1mb2N1c2VkJ11cbiAgICAgIGlmIEBtb2RlIGlzIG9sZE1vZGVcbiAgICAgICAgY2xhc3NUb0FkZC5wdXNoKG9sZE1vZGUgKyBcIi1tb2RlXCIpXG4gICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKGNsYXNzVG9BZGQuLi4pXG5cbiAgIyBBbGwgc3Vic2NyaXB0aW9ucyBoZXJlIGlzIGNlbGFyZWQgb24gZWFjaCBvcGVyYXRpb24gZmluaXNoZWQuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBvbkRpZENoYW5nZVNlYXJjaDogKGZuKSAtPiBAc3Vic2NyaWJlIEBzZWFyY2hJbnB1dC5vbkRpZENoYW5nZShmbilcbiAgb25EaWRDb25maXJtU2VhcmNoOiAoZm4pIC0+IEBzdWJzY3JpYmUgQHNlYXJjaElucHV0Lm9uRGlkQ29uZmlybShmbilcbiAgb25EaWRDYW5jZWxTZWFyY2g6IChmbikgLT4gQHN1YnNjcmliZSBAc2VhcmNoSW5wdXQub25EaWRDYW5jZWwoZm4pXG4gIG9uRGlkQ29tbWFuZFNlYXJjaDogKGZuKSAtPiBAc3Vic2NyaWJlIEBzZWFyY2hJbnB1dC5vbkRpZENvbW1hbmQoZm4pXG5cbiAgIyBTZWxlY3QgYW5kIHRleHQgbXV0YXRpb24oQ2hhbmdlKVxuICBvbkRpZFNldFRhcmdldDogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtc2V0LXRhcmdldCcsIGZuKVxuICBlbWl0RGlkU2V0VGFyZ2V0OiAob3BlcmF0b3IpIC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1zZXQtdGFyZ2V0Jywgb3BlcmF0b3IpXG5cbiAgb25XaWxsU2VsZWN0VGFyZ2V0OiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ3dpbGwtc2VsZWN0LXRhcmdldCcsIGZuKVxuICBlbWl0V2lsbFNlbGVjdFRhcmdldDogLT4gQGVtaXR0ZXIuZW1pdCgnd2lsbC1zZWxlY3QtdGFyZ2V0JylcblxuICBvbkRpZFNlbGVjdFRhcmdldDogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtc2VsZWN0LXRhcmdldCcsIGZuKVxuICBlbWl0RGlkU2VsZWN0VGFyZ2V0OiAtPiBAZW1pdHRlci5lbWl0KCdkaWQtc2VsZWN0LXRhcmdldCcpXG5cbiAgb25EaWRGYWlsU2VsZWN0VGFyZ2V0OiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1mYWlsLXNlbGVjdC10YXJnZXQnLCBmbilcbiAgZW1pdERpZEZhaWxTZWxlY3RUYXJnZXQ6IC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1mYWlsLXNlbGVjdC10YXJnZXQnKVxuXG4gIG9uV2lsbEZpbmlzaE11dGF0aW9uOiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ29uLXdpbGwtZmluaXNoLW11dGF0aW9uJywgZm4pXG4gIGVtaXRXaWxsRmluaXNoTXV0YXRpb246IC0+IEBlbWl0dGVyLmVtaXQoJ29uLXdpbGwtZmluaXNoLW11dGF0aW9uJylcblxuICBvbkRpZEZpbmlzaE11dGF0aW9uOiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ29uLWRpZC1maW5pc2gtbXV0YXRpb24nLCBmbilcbiAgZW1pdERpZEZpbmlzaE11dGF0aW9uOiAtPiBAZW1pdHRlci5lbWl0KCdvbi1kaWQtZmluaXNoLW11dGF0aW9uJylcblxuICBvbkRpZFNldE9wZXJhdG9yTW9kaWZpZXI6IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignZGlkLXNldC1vcGVyYXRvci1tb2RpZmllcicsIGZuKVxuICBlbWl0RGlkU2V0T3BlcmF0b3JNb2RpZmllcjogKG9wdGlvbnMpIC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1zZXQtb3BlcmF0b3ItbW9kaWZpZXInLCBvcHRpb25zKVxuXG4gIG9uRGlkRmluaXNoT3BlcmF0aW9uOiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1maW5pc2gtb3BlcmF0aW9uJywgZm4pXG4gIGVtaXREaWRGaW5pc2hPcGVyYXRpb246IC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1maW5pc2gtb3BlcmF0aW9uJylcblxuICBvbkRpZFJlc2V0T3BlcmF0aW9uU3RhY2s6IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignZGlkLXJlc2V0LW9wZXJhdGlvbi1zdGFjaycsIGZuKVxuICBlbWl0RGlkUmVzZXRPcGVyYXRpb25TdGFjazogLT4gQGVtaXR0ZXIuZW1pdCgnZGlkLXJlc2V0LW9wZXJhdGlvbi1zdGFjaycpXG5cbiAgIyBTZWxlY3QgbGlzdCB2aWV3XG4gIG9uRGlkQ29uZmlybVNlbGVjdExpc3Q6IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignZGlkLWNvbmZpcm0tc2VsZWN0LWxpc3QnLCBmbilcbiAgb25EaWRDYW5jZWxTZWxlY3RMaXN0OiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1jYW5jZWwtc2VsZWN0LWxpc3QnLCBmbilcblxuICAjIFByb3h5aW5nIG1vZGVNYW5nZXIncyBldmVudCBob29rIHdpdGggc2hvcnQtbGlmZSBzdWJzY3JpcHRpb24uXG4gIG9uV2lsbEFjdGl2YXRlTW9kZTogKGZuKSAtPiBAc3Vic2NyaWJlIEBtb2RlTWFuYWdlci5vbldpbGxBY3RpdmF0ZU1vZGUoZm4pXG4gIG9uRGlkQWN0aXZhdGVNb2RlOiAoZm4pIC0+IEBzdWJzY3JpYmUgQG1vZGVNYW5hZ2VyLm9uRGlkQWN0aXZhdGVNb2RlKGZuKVxuICBvbldpbGxEZWFjdGl2YXRlTW9kZTogKGZuKSAtPiBAc3Vic2NyaWJlIEBtb2RlTWFuYWdlci5vbldpbGxEZWFjdGl2YXRlTW9kZShmbilcbiAgcHJlZW1wdFdpbGxEZWFjdGl2YXRlTW9kZTogKGZuKSAtPiBAc3Vic2NyaWJlIEBtb2RlTWFuYWdlci5wcmVlbXB0V2lsbERlYWN0aXZhdGVNb2RlKGZuKVxuICBvbkRpZERlYWN0aXZhdGVNb2RlOiAoZm4pIC0+IEBzdWJzY3JpYmUgQG1vZGVNYW5hZ2VyLm9uRGlkRGVhY3RpdmF0ZU1vZGUoZm4pXG5cbiAgIyBFdmVudHNcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIG9uRGlkRmFpbFRvUHVzaFRvT3BlcmF0aW9uU3RhY2s6IChmbikgLT4gQGVtaXR0ZXIub24oJ2RpZC1mYWlsLXRvLXB1c2gtdG8tb3BlcmF0aW9uLXN0YWNrJywgZm4pXG4gIGVtaXREaWRGYWlsVG9QdXNoVG9PcGVyYXRpb25TdGFjazogLT4gQGVtaXR0ZXIuZW1pdCgnZGlkLWZhaWwtdG8tcHVzaC10by1vcGVyYXRpb24tc3RhY2snKVxuXG4gIG9uRGlkRGVzdHJveTogKGZuKSAtPiBAZW1pdHRlci5vbignZGlkLWRlc3Ryb3knLCBmbilcblxuICAjICogYGZuYCB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCB3aGVuIG1hcmsgd2FzIHNldC5cbiAgIyAgICogYG5hbWVgIE5hbWUgb2YgbWFyayBzdWNoIGFzICdhJy5cbiAgIyAgICogYGJ1ZmZlclBvc2l0aW9uYDogYnVmZmVyUG9zaXRpb24gd2hlcmUgbWFyayB3YXMgc2V0LlxuICAjICAgKiBgZWRpdG9yYDogZWRpdG9yIHdoZXJlIG1hcmsgd2FzIHNldC5cbiAgIyBSZXR1cm5zIGEge0Rpc3Bvc2FibGV9IG9uIHdoaWNoIGAuZGlzcG9zZSgpYCBjYW4gYmUgY2FsbGVkIHRvIHVuc3Vic2NyaWJlLlxuICAjXG4gICMgIFVzYWdlOlxuICAjICAgb25EaWRTZXRNYXJrICh7bmFtZSwgYnVmZmVyUG9zaXRpb259KSAtPiBkbyBzb21ldGhpbmcuLlxuICBvbkRpZFNldE1hcms6IChmbikgLT4gQGVtaXR0ZXIub24oJ2RpZC1zZXQtbWFyaycsIGZuKVxuXG4gIG9uRGlkU2V0SW5wdXRDaGFyOiAoZm4pIC0+IEBlbWl0dGVyLm9uKCdkaWQtc2V0LWlucHV0LWNoYXInLCBmbilcbiAgZW1pdERpZFNldElucHV0Q2hhcjogKGNoYXIpIC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1zZXQtaW5wdXQtY2hhcicsIGNoYXIpXG5cbiAgaXNBbGl2ZTogLT5cbiAgICBAY29uc3RydWN0b3IuaGFzKEBlZGl0b3IpXG5cbiAgZGVzdHJveTogPT5cbiAgICByZXR1cm4gdW5sZXNzIEBpc0FsaXZlKClcbiAgICBAY29uc3RydWN0b3IuZGVsZXRlKEBlZGl0b3IpXG5cbiAgICBCbG9ja3dpc2VTZWxlY3Rpb24gPz0gcmVxdWlyZSAnLi9ibG9ja3dpc2Utc2VsZWN0aW9uJ1xuICAgIEJsb2Nrd2lzZVNlbGVjdGlvbi5jbGVhclNlbGVjdGlvbnMoQGVkaXRvcilcblxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuXG4gICAgaWYgQGVkaXRvci5pc0FsaXZlKClcbiAgICAgIEByZXNldE5vcm1hbE1vZGUoKVxuICAgICAgQHJlc2V0KClcbiAgICAgIEBlZGl0b3JFbGVtZW50LmNvbXBvbmVudD8uc2V0SW5wdXRFbmFibGVkKHRydWUpXG4gICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCd2aW0tbW9kZS1wbHVzJywgJ25vcm1hbC1tb2RlJylcblxuICAgIHtcbiAgICAgIEBob3ZlciwgQGhvdmVyU2VhcmNoQ291bnRlciwgQG9wZXJhdGlvblN0YWNrLFxuICAgICAgQHNlYXJjaEhpc3RvcnksIEBjdXJzb3JTdHlsZU1hbmFnZXJcbiAgICAgIEBtb2RlTWFuYWdlciwgQHJlZ2lzdGVyXG4gICAgICBAZWRpdG9yLCBAZWRpdG9yRWxlbWVudCwgQHN1YnNjcmlwdGlvbnMsXG4gICAgICBAb2NjdXJyZW5jZU1hbmFnZXJcbiAgICAgIEBwcmV2aW91c1NlbGVjdGlvblxuICAgICAgQHBlcnNpc3RlbnRTZWxlY3Rpb25cbiAgICB9ID0ge31cbiAgICBAZW1pdHRlci5lbWl0ICdkaWQtZGVzdHJveSdcblxuICBjaGVja1NlbGVjdGlvbjogKGV2ZW50KSAtPlxuICAgIHJldHVybiB1bmxlc3MgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpIGlzIEBlZGl0b3JcbiAgICByZXR1cm4gaWYgQF9fb3BlcmF0aW9uU3RhY2s/IGFuZCBAb3BlcmF0aW9uU3RhY2suaXNQcm9jZXNzaW5nKCkgIyBEb24ndCBwb3B1bGF0ZSBsYXp5LXByb3Agb24gc3RhcnR1cFxuICAgIHJldHVybiBpZiBAbW9kZSBpcyAnaW5zZXJ0J1xuICAgICMgSW50ZW50aW9uYWxseSB1c2luZyB0YXJnZXQuY2xvc2VzdCgnYXRvbS10ZXh0LWVkaXRvcicpXG4gICAgIyBEb24ndCB1c2UgdGFyZ2V0LmdldE1vZGVsKCkgd2hpY2ggaXMgd29yayBmb3IgQ3VzdG9tRXZlbnQgYnV0IG5vdCB3b3JrIGZvciBtb3VzZSBldmVudC5cbiAgICByZXR1cm4gdW5sZXNzIEBlZGl0b3JFbGVtZW50IGlzIGV2ZW50LnRhcmdldD8uY2xvc2VzdD8oJ2F0b20tdGV4dC1lZGl0b3InKVxuICAgIHJldHVybiBpZiBldmVudC50eXBlLnN0YXJ0c1dpdGgoJ3ZpbS1tb2RlLXBsdXMnKSAjIHRvIG1hdGNoIHZpbS1tb2RlLXBsdXM6IGFuZCB2aW0tbW9kZS1wbHVzLXVzZXI6XG5cbiAgICBpZiBoYXZlU29tZU5vbkVtcHR5U2VsZWN0aW9uKEBlZGl0b3IpXG4gICAgICBAZWRpdG9yRWxlbWVudC5jb21wb25lbnQudXBkYXRlU3luYygpXG4gICAgICB3aXNlID0gc3dyYXAuZGV0ZWN0V2lzZShAZWRpdG9yKVxuICAgICAgaWYgQGlzTW9kZSgndmlzdWFsJywgd2lzZSlcbiAgICAgICAgZm9yICRzZWxlY3Rpb24gaW4gc3dyYXAuZ2V0U2VsZWN0aW9ucyhAZWRpdG9yKVxuICAgICAgICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKVxuICAgICAgICBAdXBkYXRlQ3Vyc29yc1Zpc2liaWxpdHkoKVxuICAgICAgZWxzZVxuICAgICAgICBAYWN0aXZhdGUoJ3Zpc3VhbCcsIHdpc2UpXG4gICAgZWxzZVxuICAgICAgQGFjdGl2YXRlKCdub3JtYWwnKSBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuXG4gIG9ic2VydmVTZWxlY3Rpb25zOiAtPlxuICAgIGNoZWNrU2VsZWN0aW9uID0gQGNoZWNrU2VsZWN0aW9uLmJpbmQodGhpcylcbiAgICBAZWRpdG9yRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgY2hlY2tTZWxlY3Rpb24pXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIG5ldyBEaXNwb3NhYmxlID0+XG4gICAgICBAZWRpdG9yRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgY2hlY2tTZWxlY3Rpb24pXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5vbkRpZERpc3BhdGNoKGNoZWNrU2VsZWN0aW9uKVxuXG4gICAgQGVkaXRvckVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCBjaGVja1NlbGVjdGlvbilcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgbmV3IERpc3Bvc2FibGUgPT5cbiAgICAgIEBlZGl0b3JFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgY2hlY2tTZWxlY3Rpb24pXG5cbiAgIyBXaGF0J3MgdGhpcz9cbiAgIyBlZGl0b3IuY2xlYXJTZWxlY3Rpb25zKCkgZG9lc24ndCByZXNwZWN0IGxhc3RDdXJzb3IgcG9zaXRvaW4uXG4gICMgVGhpcyBtZXRob2Qgd29ya3MgaW4gc2FtZSB3YXkgYXMgZWRpdG9yLmNsZWFyU2VsZWN0aW9ucygpIGJ1dCByZXNwZWN0IGxhc3QgY3Vyc29yIHBvc2l0aW9uLlxuICBjbGVhclNlbGVjdGlvbnM6IC0+XG4gICAgQGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG5cbiAgcmVzZXROb3JtYWxNb2RlOiAoe3VzZXJJbnZvY2F0aW9ufT17fSkgLT5cbiAgICBCbG9ja3dpc2VTZWxlY3Rpb24gPz0gcmVxdWlyZSAnLi9ibG9ja3dpc2Utc2VsZWN0aW9uJ1xuICAgIEJsb2Nrd2lzZVNlbGVjdGlvbi5jbGVhclNlbGVjdGlvbnMoQGVkaXRvcilcblxuICAgIGlmIHVzZXJJbnZvY2F0aW9uID8gZmFsc2VcbiAgICAgIHN3aXRjaFxuICAgICAgICB3aGVuIEBlZGl0b3IuaGFzTXVsdGlwbGVDdXJzb3JzKClcbiAgICAgICAgICBAY2xlYXJTZWxlY3Rpb25zKClcbiAgICAgICAgd2hlbiBAaGFzUGVyc2lzdGVudFNlbGVjdGlvbnMoKSBhbmQgQGdldENvbmZpZygnY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9uT25SZXNldE5vcm1hbE1vZGUnKVxuICAgICAgICAgIEBjbGVhclBlcnNpc3RlbnRTZWxlY3Rpb25zKClcbiAgICAgICAgd2hlbiBAb2NjdXJyZW5jZU1hbmFnZXIuaGFzUGF0dGVybnMoKVxuICAgICAgICAgIEBvY2N1cnJlbmNlTWFuYWdlci5yZXNldFBhdHRlcm5zKClcblxuICAgICAgaWYgQGdldENvbmZpZygnY2xlYXJIaWdobGlnaHRTZWFyY2hPblJlc2V0Tm9ybWFsTW9kZScpXG4gICAgICAgIEBnbG9iYWxTdGF0ZS5zZXQoJ2hpZ2hsaWdodFNlYXJjaFBhdHRlcm4nLCBudWxsKVxuICAgIGVsc2VcbiAgICAgIEBjbGVhclNlbGVjdGlvbnMoKVxuICAgIEBhY3RpdmF0ZSgnbm9ybWFsJylcblxuICBpbml0OiAtPlxuICAgIEBzYXZlT3JpZ2luYWxDdXJzb3JQb3NpdGlvbigpXG5cbiAgcmVzZXQ6IC0+XG4gICAgIyBEb24ndCBwb3B1bGF0ZSBsYXp5LXByb3Agb24gc3RhcnR1cFxuICAgIEByZWdpc3Rlci5yZXNldCgpIGlmIEBfX3JlZ2lzdGVyP1xuICAgIEBzZWFyY2hIaXN0b3J5LnJlc2V0KCkgaWYgQF9fc2VhcmNoSGlzdG9yeT9cbiAgICBAaG92ZXIucmVzZXQoKSBpZiBAX19ob3Zlcj9cbiAgICBAb3BlcmF0aW9uU3RhY2sucmVzZXQoKSBpZiBAX19vcGVyYXRpb25TdGFjaz9cbiAgICBAbXV0YXRpb25NYW5hZ2VyLnJlc2V0KCkgaWYgQF9fbXV0YXRpb25NYW5hZ2VyP1xuXG4gIGlzVmlzaWJsZTogLT5cbiAgICBAZWRpdG9yIGluIGdldFZpc2libGVFZGl0b3JzKClcblxuICB1cGRhdGVDdXJzb3JzVmlzaWJpbGl0eTogLT5cbiAgICBAY3Vyc29yU3R5bGVNYW5hZ2VyLnJlZnJlc2goKVxuXG4gICMgRklYTUU6IG5hbWluZywgdXBkYXRlTGFzdFNlbGVjdGVkSW5mbyA/XG4gIHVwZGF0ZVByZXZpb3VzU2VsZWN0aW9uOiAtPlxuICAgIGlmIEBpc01vZGUoJ3Zpc3VhbCcsICdibG9ja3dpc2UnKVxuICAgICAgcHJvcGVydGllcyA9IEBnZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uKCk/LmdldFByb3BlcnRpZXMoKVxuICAgIGVsc2VcbiAgICAgIHByb3BlcnRpZXMgPSBzd3JhcChAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKSkuZ2V0UHJvcGVydGllcygpXG5cbiAgICAjIFRPRE8jNzA0IHdoZW4gY3Vyc29yIGlzIGFkZGVkIGluIHZpc3VhbC1tb2RlLCBjb3JyZXNwb25kaW5nIHNlbGVjdGlvbiBwcm9wIHlldCBub3QgZXhpc3RzLlxuICAgIHJldHVybiB1bmxlc3MgcHJvcGVydGllc1xuXG4gICAge2hlYWQsIHRhaWx9ID0gcHJvcGVydGllc1xuXG4gICAgaWYgaGVhZC5pc0dyZWF0ZXJUaGFuT3JFcXVhbCh0YWlsKVxuICAgICAgW3N0YXJ0LCBlbmRdID0gW3RhaWwsIGhlYWRdXG4gICAgICBoZWFkID0gZW5kID0gdHJhbnNsYXRlUG9pbnRBbmRDbGlwKEBlZGl0b3IsIGVuZCwgJ2ZvcndhcmQnKVxuICAgIGVsc2VcbiAgICAgIFtzdGFydCwgZW5kXSA9IFtoZWFkLCB0YWlsXVxuICAgICAgdGFpbCA9IGVuZCA9IHRyYW5zbGF0ZVBvaW50QW5kQ2xpcChAZWRpdG9yLCBlbmQsICdmb3J3YXJkJylcblxuICAgIEBtYXJrLnNldCgnPCcsIHN0YXJ0KVxuICAgIEBtYXJrLnNldCgnPicsIGVuZClcbiAgICBAcHJldmlvdXNTZWxlY3Rpb24gPSB7cHJvcGVydGllczoge2hlYWQsIHRhaWx9LCBAc3VibW9kZX1cblxuICAjIFBlcnNpc3RlbnQgc2VsZWN0aW9uXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBoYXNQZXJzaXN0ZW50U2VsZWN0aW9uczogLT5cbiAgICBAcGVyc2lzdGVudFNlbGVjdGlvbi5oYXNNYXJrZXJzKClcblxuICBnZXRQZXJzaXN0ZW50U2VsZWN0aW9uQnVmZmVyUmFuZ2VzOiAtPlxuICAgIEBwZXJzaXN0ZW50U2VsZWN0aW9uLmdldE1hcmtlckJ1ZmZlclJhbmdlcygpXG5cbiAgY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9uczogLT5cbiAgICBAcGVyc2lzdGVudFNlbGVjdGlvbi5jbGVhck1hcmtlcnMoKVxuXG4gICMgQW5pbWF0aW9uIG1hbmFnZW1lbnRcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHNjcm9sbEFuaW1hdGlvbkVmZmVjdDogbnVsbFxuICByZXF1ZXN0U2Nyb2xsQW5pbWF0aW9uOiAoZnJvbSwgdG8sIG9wdGlvbnMpIC0+XG4gICAgalF1ZXJ5ID89IHJlcXVpcmUoJ2F0b20tc3BhY2UtcGVuLXZpZXdzJykualF1ZXJ5XG4gICAgQHNjcm9sbEFuaW1hdGlvbkVmZmVjdCA9IGpRdWVyeShmcm9tKS5hbmltYXRlKHRvLCBvcHRpb25zKVxuXG4gIGZpbmlzaFNjcm9sbEFuaW1hdGlvbjogLT5cbiAgICBAc2Nyb2xsQW5pbWF0aW9uRWZmZWN0Py5maW5pc2goKVxuICAgIEBzY3JvbGxBbmltYXRpb25FZmZlY3QgPSBudWxsXG5cbiAgIyBPdGhlclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgc2F2ZU9yaWdpbmFsQ3Vyc29yUG9zaXRpb246IC0+XG4gICAgQG9yaWdpbmFsQ3Vyc29yUG9zaXRpb24gPSBudWxsXG4gICAgQG9yaWdpbmFsQ3Vyc29yUG9zaXRpb25CeU1hcmtlcj8uZGVzdHJveSgpXG5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgc2VsZWN0aW9uID0gQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKClcbiAgICAgIHBvaW50ID0gc3dyYXAoc2VsZWN0aW9uKS5nZXRCdWZmZXJQb3NpdGlvbkZvcignaGVhZCcsIGZyb206IFsncHJvcGVydHknLCAnc2VsZWN0aW9uJ10pXG4gICAgZWxzZVxuICAgICAgcG9pbnQgPSBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICBAb3JpZ2luYWxDdXJzb3JQb3NpdGlvbiA9IHBvaW50XG4gICAgQG9yaWdpbmFsQ3Vyc29yUG9zaXRpb25CeU1hcmtlciA9IEBlZGl0b3IubWFya0J1ZmZlclBvc2l0aW9uKHBvaW50LCBpbnZhbGlkYXRlOiAnbmV2ZXInKVxuXG4gIHJlc3RvcmVPcmlnaW5hbEN1cnNvclBvc2l0aW9uOiAtPlxuICAgIEBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oQGdldE9yaWdpbmFsQ3Vyc29yUG9zaXRpb24oKSlcblxuICBnZXRPcmlnaW5hbEN1cnNvclBvc2l0aW9uOiAtPlxuICAgIEBvcmlnaW5hbEN1cnNvclBvc2l0aW9uXG5cbiAgZ2V0T3JpZ2luYWxDdXJzb3JQb3NpdGlvbkJ5TWFya2VyOiAtPlxuICAgIEBvcmlnaW5hbEN1cnNvclBvc2l0aW9uQnlNYXJrZXIuZ2V0U3RhcnRCdWZmZXJQb3NpdGlvbigpXG4iXX0=
