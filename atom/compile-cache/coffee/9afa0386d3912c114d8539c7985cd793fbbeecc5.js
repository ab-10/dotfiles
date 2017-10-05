(function() {
  var Base, CompositeDisposable, Disposable, MoveToRelativeLine, OperationAbortedError, OperationStack, Select, assertWithException, haveSomeNonEmptySelection, moveCursorLeft, ref, ref1, ref2, swrap;

  ref = require('atom'), Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  Base = require('./base');

  ref1 = require('./utils'), moveCursorLeft = ref1.moveCursorLeft, haveSomeNonEmptySelection = ref1.haveSomeNonEmptySelection, assertWithException = ref1.assertWithException;

  OperationAbortedError = require('./errors').OperationAbortedError;

  swrap = require('./selection-wrapper');

  ref2 = [], Select = ref2[0], MoveToRelativeLine = ref2[1];

  OperationStack = (function() {
    Object.defineProperty(OperationStack.prototype, 'mode', {
      get: function() {
        return this.modeManager.mode;
      }
    });

    Object.defineProperty(OperationStack.prototype, 'submode', {
      get: function() {
        return this.modeManager.submode;
      }
    });

    function OperationStack(vimState) {
      var ref3;
      this.vimState = vimState;
      ref3 = this.vimState, this.editor = ref3.editor, this.editorElement = ref3.editorElement, this.modeManager = ref3.modeManager;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
      this.reset();
    }

    OperationStack.prototype.subscribe = function(handler) {
      this.operationSubscriptions.add(handler);
      return handler;
    };

    OperationStack.prototype.reset = function() {
      var ref3;
      this.resetCount();
      this.stack = [];
      this.processing = false;
      this.vimState.emitDidResetOperationStack();
      if ((ref3 = this.operationSubscriptions) != null) {
        ref3.dispose();
      }
      return this.operationSubscriptions = new CompositeDisposable;
    };

    OperationStack.prototype.destroy = function() {
      var ref3, ref4;
      this.subscriptions.dispose();
      if ((ref3 = this.operationSubscriptions) != null) {
        ref3.dispose();
      }
      return ref4 = {}, this.stack = ref4.stack, this.operationSubscriptions = ref4.operationSubscriptions, ref4;
    };

    OperationStack.prototype.peekTop = function() {
      return this.stack[this.stack.length - 1];
    };

    OperationStack.prototype.isEmpty = function() {
      return this.stack.length === 0;
    };

    OperationStack.prototype.newMoveToRelativeLine = function() {
      if (MoveToRelativeLine == null) {
        MoveToRelativeLine = Base.getClass('MoveToRelativeLine');
      }
      return new MoveToRelativeLine(this.vimState);
    };

    OperationStack.prototype.newSelectWithTarget = function(target) {
      if (Select == null) {
        Select = Base.getClass('Select');
      }
      return new Select(this.vimState).setTarget(target);
    };

    OperationStack.prototype.run = function(klass, properties) {
      var $selection, error, i, len, operation, ref3, ref4, type;
      if (this.mode === 'visual') {
        ref3 = swrap.getSelections(this.editor);
        for (i = 0, len = ref3.length; i < len; i++) {
          $selection = ref3[i];
          if (!$selection.hasProperties()) {
            $selection.saveProperties();
          }
        }
      }
      try {
        if (this.isEmpty()) {
          this.vimState.init();
        }
        type = typeof klass;
        if (type === 'object') {
          operation = klass;
        } else {
          if (type === 'string') {
            klass = Base.getClass(klass);
          }
          if (((ref4 = this.peekTop()) != null ? ref4.constructor : void 0) === klass) {
            operation = this.newMoveToRelativeLine();
          } else {
            operation = new klass(this.vimState, properties);
          }
        }
        switch (false) {
          case !this.isEmpty():
            if ((this.mode === 'visual' && operation.isMotion()) || operation.isTextObject()) {
              operation = this.newSelectWithTarget(operation);
            }
            this.stack.push(operation);
            return this.process();
          case !(this.peekTop().isOperator() && (operation.isMotion() || operation.isTextObject())):
            this.stack.push(operation);
            return this.process();
          default:
            this.vimState.emitDidFailToPushToOperationStack();
            return this.vimState.resetNormalMode();
        }
      } catch (error1) {
        error = error1;
        return this.handleError(error);
      }
    };

    OperationStack.prototype.runRecorded = function() {
      var count, operation, ref3;
      if (operation = this.recordedOperation) {
        operation.repeated = true;
        if (this.hasCount()) {
          count = this.getCount();
          operation.count = count;
          if ((ref3 = operation.target) != null) {
            ref3.count = count;
          }
        }
        operation.subscribeResetOccurrencePatternIfNeeded();
        return this.run(operation);
      }
    };

    OperationStack.prototype.runRecordedMotion = function(key, arg) {
      var operation, reverse;
      reverse = (arg != null ? arg : {}).reverse;
      if (!(operation = this.vimState.globalState.get(key))) {
        return;
      }
      operation = operation.clone(this.vimState);
      operation.repeated = true;
      operation.resetCount();
      if (reverse) {
        operation.backwards = !operation.backwards;
      }
      return this.run(operation);
    };

    OperationStack.prototype.runCurrentFind = function(options) {
      return this.runRecordedMotion('currentFind', options);
    };

    OperationStack.prototype.runCurrentSearch = function(options) {
      return this.runRecordedMotion('currentSearch', options);
    };

    OperationStack.prototype.handleError = function(error) {
      this.vimState.reset();
      if (!(error instanceof OperationAbortedError)) {
        throw error;
      }
    };

    OperationStack.prototype.isProcessing = function() {
      return this.processing;
    };

    OperationStack.prototype.process = function() {
      var base, commandName, operation, top;
      this.processing = true;
      if (this.stack.length === 2) {
        if (!this.peekTop().isComplete()) {
          return;
        }
        operation = this.stack.pop();
        this.peekTop().setTarget(operation);
      }
      top = this.peekTop();
      if (top.isComplete()) {
        return this.execute(this.stack.pop());
      } else {
        if (this.mode === 'normal' && top.isOperator()) {
          this.modeManager.activate('operator-pending');
        }
        if (commandName = typeof (base = top.constructor).getCommandNameWithoutPrefix === "function" ? base.getCommandNameWithoutPrefix() : void 0) {
          return this.addToClassList(commandName + "-pending");
        }
      }
    };

    OperationStack.prototype.execute = function(operation) {
      var execution;
      execution = operation.execute();
      if (execution instanceof Promise) {
        return execution.then((function(_this) {
          return function() {
            return _this.finish(operation);
          };
        })(this))["catch"]((function(_this) {
          return function() {
            return _this.handleError();
          };
        })(this));
      } else {
        return this.finish(operation);
      }
    };

    OperationStack.prototype.cancel = function() {
      var ref3;
      if ((ref3 = this.mode) !== 'visual' && ref3 !== 'insert') {
        this.vimState.resetNormalMode();
        this.vimState.restoreOriginalCursorPosition();
      }
      return this.finish();
    };

    OperationStack.prototype.finish = function(operation) {
      if (operation == null) {
        operation = null;
      }
      if (operation != null ? operation.recordable : void 0) {
        this.recordedOperation = operation;
      }
      this.vimState.emitDidFinishOperation();
      if (operation != null ? operation.isOperator() : void 0) {
        operation.resetState();
      }
      if (this.mode === 'normal') {
        this.ensureAllSelectionsAreEmpty(operation);
        this.ensureAllCursorsAreNotAtEndOfLine();
      } else if (this.mode === 'visual') {
        this.modeManager.updateNarrowedState();
        this.vimState.updatePreviousSelection();
      }
      this.vimState.updateCursorsVisibility();
      return this.vimState.reset();
    };

    OperationStack.prototype.ensureAllSelectionsAreEmpty = function(operation) {
      this.vimState.clearBlockwiseSelections();
      if (haveSomeNonEmptySelection(this.editor)) {
        if (this.vimState.getConfig('strictAssertion')) {
          assertWithException(false, "Have some non-empty selection in normal-mode: " + (operation.toString()));
        }
        return this.vimState.clearSelections();
      }
    };

    OperationStack.prototype.ensureAllCursorsAreNotAtEndOfLine = function() {
      var cursor, i, len, ref3, results;
      ref3 = this.editor.getCursors();
      results = [];
      for (i = 0, len = ref3.length; i < len; i++) {
        cursor = ref3[i];
        if (cursor.isAtEndOfLine()) {
          results.push(moveCursorLeft(cursor, {
            preserveGoalColumn: true
          }));
        }
      }
      return results;
    };

    OperationStack.prototype.addToClassList = function(className) {
      this.editorElement.classList.add(className);
      return this.subscribe(new Disposable((function(_this) {
        return function() {
          return _this.editorElement.classList.remove(className);
        };
      })(this)));
    };

    OperationStack.prototype.hasCount = function() {
      return (this.count['normal'] != null) || (this.count['operator-pending'] != null);
    };

    OperationStack.prototype.getCount = function() {
      var ref3, ref4;
      if (this.hasCount()) {
        return ((ref3 = this.count['normal']) != null ? ref3 : 1) * ((ref4 = this.count['operator-pending']) != null ? ref4 : 1);
      } else {
        return null;
      }
    };

    OperationStack.prototype.setCount = function(number) {
      var base, mode;
      mode = 'normal';
      if (this.mode === 'operator-pending') {
        mode = this.mode;
      }
      if ((base = this.count)[mode] == null) {
        base[mode] = 0;
      }
      this.count[mode] = (this.count[mode] * 10) + number;
      this.vimState.hover.set(this.buildCountString());
      return this.editorElement.classList.toggle('with-count', true);
    };

    OperationStack.prototype.buildCountString = function() {
      return [this.count['normal'], this.count['operator-pending']].filter(function(count) {
        return count != null;
      }).map(function(count) {
        return String(count);
      }).join('x');
    };

    OperationStack.prototype.resetCount = function() {
      this.count = {};
      return this.editorElement.classList.remove('with-count');
    };

    return OperationStack;

  })();

  module.exports = OperationStack;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2FydHJlLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdGlvbi1zdGFjay5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQW9DLE9BQUEsQ0FBUSxNQUFSLENBQXBDLEVBQUMsMkJBQUQsRUFBYTs7RUFDYixJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0VBQ1AsT0FBbUUsT0FBQSxDQUFRLFNBQVIsQ0FBbkUsRUFBQyxvQ0FBRCxFQUFpQiwwREFBakIsRUFBNEM7O0VBQzNDLHdCQUF5QixPQUFBLENBQVEsVUFBUjs7RUFDMUIsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUjs7RUFFUixPQUErQixFQUEvQixFQUFDLGdCQUFELEVBQVM7O0VBWUg7SUFDSixNQUFNLENBQUMsY0FBUCxDQUFzQixjQUFDLENBQUEsU0FBdkIsRUFBa0MsTUFBbEMsRUFBMEM7TUFBQSxHQUFBLEVBQUssU0FBQTtlQUFHLElBQUMsQ0FBQSxXQUFXLENBQUM7TUFBaEIsQ0FBTDtLQUExQzs7SUFDQSxNQUFNLENBQUMsY0FBUCxDQUFzQixjQUFDLENBQUEsU0FBdkIsRUFBa0MsU0FBbEMsRUFBNkM7TUFBQSxHQUFBLEVBQUssU0FBQTtlQUFHLElBQUMsQ0FBQSxXQUFXLENBQUM7TUFBaEIsQ0FBTDtLQUE3Qzs7SUFFYSx3QkFBQyxRQUFEO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxXQUFEO01BQ1osT0FBMEMsSUFBQyxDQUFBLFFBQTNDLEVBQUMsSUFBQyxDQUFBLGNBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxxQkFBQSxhQUFYLEVBQTBCLElBQUMsQ0FBQSxtQkFBQTtNQUUzQixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVYsQ0FBdUIsSUFB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LElBSEgsQ0FHUSxHQUhSO0lBRGdCOzs2QkFNbEIsVUFBQSxHQUFZLFNBQUE7TUFDVixJQUFDLENBQUEsS0FBRCxHQUFTO2FBQ1QsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFTLENBQUMsTUFBekIsQ0FBZ0MsWUFBaEM7SUFGVTs7Ozs7O0VBSWQsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFuUGpCIiwic291cmNlc0NvbnRlbnQiOlsie0Rpc3Bvc2FibGUsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbkJhc2UgPSByZXF1aXJlICcuL2Jhc2UnXG57bW92ZUN1cnNvckxlZnQsIGhhdmVTb21lTm9uRW1wdHlTZWxlY3Rpb24sIGFzc2VydFdpdGhFeGNlcHRpb259ID0gcmVxdWlyZSAnLi91dGlscydcbntPcGVyYXRpb25BYm9ydGVkRXJyb3J9ID0gcmVxdWlyZSAnLi9lcnJvcnMnXG5zd3JhcCA9IHJlcXVpcmUgJy4vc2VsZWN0aW9uLXdyYXBwZXInXG5cbltTZWxlY3QsIE1vdmVUb1JlbGF0aXZlTGluZV0gPSBbXVxuXG4jIG9wcmF0aW9uIGxpZmUgaW4gb3BlcmF0aW9uU3RhY2tcbiMgMS4gcnVuXG4jICAgIGluc3RhbnRpYXRlZCBieSBuZXcuXG4jICAgIGNvbXBsaW1lbnQgaW1wbGljaXQgT3BlcmF0b3IuU2VsZWN0IG9wZXJhdG9yIGlmIG5lY2Vzc2FyeS5cbiMgICAgcHVzaCBvcGVyYXRpb24gdG8gc3RhY2suXG4jIDIuIHByb2Nlc3NcbiMgICAgcmVkdWNlIHN0YWNrIGJ5LCBwb3BwaW5nIHRvcCBvZiBzdGFjayB0aGVuIHNldCBpdCBhcyB0YXJnZXQgb2YgbmV3IHRvcC5cbiMgICAgY2hlY2sgaWYgcmVtYWluaW5nIHRvcCBvZiBzdGFjayBpcyBleGVjdXRhYmxlIGJ5IGNhbGxpbmcgaXNDb21wbGV0ZSgpXG4jICAgIGlmIGV4ZWN1dGFibGUsIHRoZW4gcG9wIHN0YWNrIHRoZW4gZXhlY3V0ZShwb3BwZWRPcGVyYXRpb24pXG4jICAgIGlmIG5vdCBleGVjdXRhYmxlLCBlbnRlciBcIm9wZXJhdG9yLXBlbmRpbmctbW9kZVwiXG5jbGFzcyBPcGVyYXRpb25TdGFja1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgJ21vZGUnLCBnZXQ6IC0+IEBtb2RlTWFuYWdlci5tb2RlXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBAcHJvdG90eXBlLCAnc3VibW9kZScsIGdldDogLT4gQG1vZGVNYW5hZ2VyLnN1Ym1vZGVcblxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvciwgQGVkaXRvckVsZW1lbnQsIEBtb2RlTWFuYWdlcn0gPSBAdmltU3RhdGVcblxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQHZpbVN0YXRlLm9uRGlkRGVzdHJveShAZGVzdHJveS5iaW5kKHRoaXMpKVxuXG4gICAgQHJlc2V0KClcblxuICAjIFJldHVybiBoYW5kbGVyXG4gIHN1YnNjcmliZTogKGhhbmRsZXIpIC0+XG4gICAgQG9wZXJhdGlvblN1YnNjcmlwdGlvbnMuYWRkKGhhbmRsZXIpXG4gICAgcmV0dXJuIGhhbmRsZXIgIyBET05UIFJFTU9WRVxuXG4gIHJlc2V0OiAtPlxuICAgIEByZXNldENvdW50KClcbiAgICBAc3RhY2sgPSBbXVxuICAgIEBwcm9jZXNzaW5nID0gZmFsc2VcblxuICAgICMgdGhpcyBoYXMgdG8gYmUgQkVGT1JFIEBvcGVyYXRpb25TdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEB2aW1TdGF0ZS5lbWl0RGlkUmVzZXRPcGVyYXRpb25TdGFjaygpXG5cbiAgICBAb3BlcmF0aW9uU3Vic2NyaXB0aW9ucz8uZGlzcG9zZSgpXG4gICAgQG9wZXJhdGlvblN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgQG9wZXJhdGlvblN1YnNjcmlwdGlvbnM/LmRpc3Bvc2UoKVxuICAgIHtAc3RhY2ssIEBvcGVyYXRpb25TdWJzY3JpcHRpb25zfSA9IHt9XG5cbiAgcGVla1RvcDogLT5cbiAgICBAc3RhY2tbQHN0YWNrLmxlbmd0aCAtIDFdXG5cbiAgaXNFbXB0eTogLT5cbiAgICBAc3RhY2subGVuZ3RoIGlzIDBcblxuICBuZXdNb3ZlVG9SZWxhdGl2ZUxpbmU6IC0+XG4gICAgTW92ZVRvUmVsYXRpdmVMaW5lID89IEJhc2UuZ2V0Q2xhc3MoJ01vdmVUb1JlbGF0aXZlTGluZScpXG4gICAgbmV3IE1vdmVUb1JlbGF0aXZlTGluZShAdmltU3RhdGUpXG5cbiAgbmV3U2VsZWN0V2l0aFRhcmdldDogKHRhcmdldCkgLT5cbiAgICBTZWxlY3QgPz0gQmFzZS5nZXRDbGFzcygnU2VsZWN0JylcbiAgICBuZXcgU2VsZWN0KEB2aW1TdGF0ZSkuc2V0VGFyZ2V0KHRhcmdldClcblxuICAjIE1haW5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHJ1bjogKGtsYXNzLCBwcm9wZXJ0aWVzKSAtPlxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBmb3IgJHNlbGVjdGlvbiBpbiBzd3JhcC5nZXRTZWxlY3Rpb25zKEBlZGl0b3IpIHdoZW4gbm90ICRzZWxlY3Rpb24uaGFzUHJvcGVydGllcygpXG4gICAgICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKVxuXG4gICAgdHJ5XG4gICAgICBAdmltU3RhdGUuaW5pdCgpIGlmIEBpc0VtcHR5KClcbiAgICAgIHR5cGUgPSB0eXBlb2Yoa2xhc3MpXG4gICAgICBpZiB0eXBlIGlzICdvYmplY3QnICMgLiByZXBlYXQgY2FzZSB3ZSBjYW4gZXhlY3V0ZSBhcy1pdC1pcy5cbiAgICAgICAgb3BlcmF0aW9uID0ga2xhc3NcbiAgICAgIGVsc2VcbiAgICAgICAga2xhc3MgPSBCYXNlLmdldENsYXNzKGtsYXNzKSBpZiB0eXBlIGlzICdzdHJpbmcnXG5cbiAgICAgICAgIyBSZXBsYWNlIG9wZXJhdG9yIHdoZW4gaWRlbnRpY2FsIG9uZSByZXBlYXRlZCwgZS5nLiBgZGRgLCBgY2NgLCBgZ1VnVWBcbiAgICAgICAgaWYgQHBlZWtUb3AoKT8uY29uc3RydWN0b3IgaXMga2xhc3NcbiAgICAgICAgICBvcGVyYXRpb24gPSBAbmV3TW92ZVRvUmVsYXRpdmVMaW5lKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG9wZXJhdGlvbiA9IG5ldyBrbGFzcyhAdmltU3RhdGUsIHByb3BlcnRpZXMpXG5cbiAgICAgIHN3aXRjaFxuICAgICAgICB3aGVuIEBpc0VtcHR5KClcbiAgICAgICAgICBpZiAoQG1vZGUgaXMgJ3Zpc3VhbCcgYW5kIG9wZXJhdGlvbi5pc01vdGlvbigpKSBvciBvcGVyYXRpb24uaXNUZXh0T2JqZWN0KClcbiAgICAgICAgICAgIG9wZXJhdGlvbiA9IEBuZXdTZWxlY3RXaXRoVGFyZ2V0KG9wZXJhdGlvbilcbiAgICAgICAgICBAc3RhY2sucHVzaChvcGVyYXRpb24pXG4gICAgICAgICAgQHByb2Nlc3MoKVxuICAgICAgICB3aGVuIEBwZWVrVG9wKCkuaXNPcGVyYXRvcigpIGFuZCAob3BlcmF0aW9uLmlzTW90aW9uKCkgb3Igb3BlcmF0aW9uLmlzVGV4dE9iamVjdCgpKVxuICAgICAgICAgIEBzdGFjay5wdXNoKG9wZXJhdGlvbilcbiAgICAgICAgICBAcHJvY2VzcygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAdmltU3RhdGUuZW1pdERpZEZhaWxUb1B1c2hUb09wZXJhdGlvblN0YWNrKClcbiAgICAgICAgICBAdmltU3RhdGUucmVzZXROb3JtYWxNb2RlKClcbiAgICBjYXRjaCBlcnJvclxuICAgICAgQGhhbmRsZUVycm9yKGVycm9yKVxuXG4gIHJ1blJlY29yZGVkOiAtPlxuICAgIGlmIG9wZXJhdGlvbiA9IEByZWNvcmRlZE9wZXJhdGlvblxuICAgICAgb3BlcmF0aW9uLnJlcGVhdGVkID0gdHJ1ZVxuICAgICAgaWYgQGhhc0NvdW50KClcbiAgICAgICAgY291bnQgPSBAZ2V0Q291bnQoKVxuICAgICAgICBvcGVyYXRpb24uY291bnQgPSBjb3VudFxuICAgICAgICBvcGVyYXRpb24udGFyZ2V0Py5jb3VudCA9IGNvdW50ICMgU29tZSBvcGVhcnRvciBoYXZlIG5vIHRhcmdldCBsaWtlIGN0cmwtYShpbmNyZWFzZSkuXG5cbiAgICAgIG9wZXJhdGlvbi5zdWJzY3JpYmVSZXNldE9jY3VycmVuY2VQYXR0ZXJuSWZOZWVkZWQoKVxuICAgICAgQHJ1bihvcGVyYXRpb24pXG5cbiAgcnVuUmVjb3JkZWRNb3Rpb246IChrZXksIHtyZXZlcnNlfT17fSkgLT5cbiAgICByZXR1cm4gdW5sZXNzIG9wZXJhdGlvbiA9IEB2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5nZXQoa2V5KVxuXG4gICAgb3BlcmF0aW9uID0gb3BlcmF0aW9uLmNsb25lKEB2aW1TdGF0ZSlcbiAgICBvcGVyYXRpb24ucmVwZWF0ZWQgPSB0cnVlXG4gICAgb3BlcmF0aW9uLnJlc2V0Q291bnQoKVxuICAgIGlmIHJldmVyc2VcbiAgICAgIG9wZXJhdGlvbi5iYWNrd2FyZHMgPSBub3Qgb3BlcmF0aW9uLmJhY2t3YXJkc1xuICAgIEBydW4ob3BlcmF0aW9uKVxuXG4gIHJ1bkN1cnJlbnRGaW5kOiAob3B0aW9ucykgLT5cbiAgICBAcnVuUmVjb3JkZWRNb3Rpb24oJ2N1cnJlbnRGaW5kJywgb3B0aW9ucylcblxuICBydW5DdXJyZW50U2VhcmNoOiAob3B0aW9ucykgLT5cbiAgICBAcnVuUmVjb3JkZWRNb3Rpb24oJ2N1cnJlbnRTZWFyY2gnLCBvcHRpb25zKVxuXG4gIGhhbmRsZUVycm9yOiAoZXJyb3IpIC0+XG4gICAgQHZpbVN0YXRlLnJlc2V0KClcbiAgICB1bmxlc3MgZXJyb3IgaW5zdGFuY2VvZiBPcGVyYXRpb25BYm9ydGVkRXJyb3JcbiAgICAgIHRocm93IGVycm9yXG5cbiAgaXNQcm9jZXNzaW5nOiAtPlxuICAgIEBwcm9jZXNzaW5nXG5cbiAgcHJvY2VzczogLT5cbiAgICBAcHJvY2Vzc2luZyA9IHRydWVcbiAgICBpZiBAc3RhY2subGVuZ3RoIGlzIDJcbiAgICAgICMgW0ZJWE1FIGlkZWFsbHldXG4gICAgICAjIElmIHRhcmdldCBpcyBub3QgY29tcGxldGUsIHdlIHBvc3Rwb25lIGNvbXBvc2luZyB0YXJnZXQgd2l0aCBvcGVyYXRvciB0byBrZWVwIHNpdHVhdGlvbiBzaW1wbGUuXG4gICAgICAjIFNvIHRoYXQgd2UgY2FuIGFzc3VtZSB3aGVuIHRhcmdldCBpcyBzZXQgdG8gb3BlcmF0b3IgaXQncyBjb21wbGV0ZS5cbiAgICAgICMgZS5nLiBgeSBzIHQgYScoc3Vycm91bmQgZm9yIHJhbmdlIGZyb20gaGVyZSB0byB0aWxsIGEpXG4gICAgICByZXR1cm4gdW5sZXNzIEBwZWVrVG9wKCkuaXNDb21wbGV0ZSgpXG5cbiAgICAgIG9wZXJhdGlvbiA9IEBzdGFjay5wb3AoKVxuICAgICAgQHBlZWtUb3AoKS5zZXRUYXJnZXQob3BlcmF0aW9uKVxuXG4gICAgdG9wID0gQHBlZWtUb3AoKVxuXG4gICAgaWYgdG9wLmlzQ29tcGxldGUoKVxuICAgICAgQGV4ZWN1dGUoQHN0YWNrLnBvcCgpKVxuICAgIGVsc2VcbiAgICAgIGlmIEBtb2RlIGlzICdub3JtYWwnIGFuZCB0b3AuaXNPcGVyYXRvcigpXG4gICAgICAgIEBtb2RlTWFuYWdlci5hY3RpdmF0ZSgnb3BlcmF0b3ItcGVuZGluZycpXG5cbiAgICAgICMgVGVtcG9yYXJ5IHNldCB3aGlsZSBjb21tYW5kIGlzIHJ1bm5pbmdcbiAgICAgIGlmIGNvbW1hbmROYW1lID0gdG9wLmNvbnN0cnVjdG9yLmdldENvbW1hbmROYW1lV2l0aG91dFByZWZpeD8oKVxuICAgICAgICBAYWRkVG9DbGFzc0xpc3QoY29tbWFuZE5hbWUgKyBcIi1wZW5kaW5nXCIpXG5cbiAgZXhlY3V0ZTogKG9wZXJhdGlvbikgLT5cbiAgICBleGVjdXRpb24gPSBvcGVyYXRpb24uZXhlY3V0ZSgpXG4gICAgaWYgZXhlY3V0aW9uIGluc3RhbmNlb2YgUHJvbWlzZVxuICAgICAgZXhlY3V0aW9uXG4gICAgICAgIC50aGVuID0+IEBmaW5pc2gob3BlcmF0aW9uKVxuICAgICAgICAuY2F0Y2ggPT4gQGhhbmRsZUVycm9yKClcbiAgICBlbHNlXG4gICAgICBAZmluaXNoKG9wZXJhdGlvbilcblxuICBjYW5jZWw6IC0+XG4gICAgaWYgQG1vZGUgbm90IGluIFsndmlzdWFsJywgJ2luc2VydCddXG4gICAgICBAdmltU3RhdGUucmVzZXROb3JtYWxNb2RlKClcbiAgICAgIEB2aW1TdGF0ZS5yZXN0b3JlT3JpZ2luYWxDdXJzb3JQb3NpdGlvbigpXG4gICAgQGZpbmlzaCgpXG5cbiAgZmluaXNoOiAob3BlcmF0aW9uPW51bGwpIC0+XG4gICAgQHJlY29yZGVkT3BlcmF0aW9uID0gb3BlcmF0aW9uIGlmIG9wZXJhdGlvbj8ucmVjb3JkYWJsZVxuICAgIEB2aW1TdGF0ZS5lbWl0RGlkRmluaXNoT3BlcmF0aW9uKClcbiAgICBpZiBvcGVyYXRpb24/LmlzT3BlcmF0b3IoKVxuICAgICAgb3BlcmF0aW9uLnJlc2V0U3RhdGUoKVxuXG4gICAgaWYgQG1vZGUgaXMgJ25vcm1hbCdcbiAgICAgIEBlbnN1cmVBbGxTZWxlY3Rpb25zQXJlRW1wdHkob3BlcmF0aW9uKVxuICAgICAgQGVuc3VyZUFsbEN1cnNvcnNBcmVOb3RBdEVuZE9mTGluZSgpXG4gICAgZWxzZSBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgQG1vZGVNYW5hZ2VyLnVwZGF0ZU5hcnJvd2VkU3RhdGUoKVxuICAgICAgQHZpbVN0YXRlLnVwZGF0ZVByZXZpb3VzU2VsZWN0aW9uKClcblxuICAgIEB2aW1TdGF0ZS51cGRhdGVDdXJzb3JzVmlzaWJpbGl0eSgpXG4gICAgQHZpbVN0YXRlLnJlc2V0KClcblxuICBlbnN1cmVBbGxTZWxlY3Rpb25zQXJlRW1wdHk6IChvcGVyYXRpb24pIC0+XG4gICAgIyBXaGVuIEB2aW1TdGF0ZS5zZWxlY3RCbG9ja3dpc2UoKSBpcyBjYWxsZWQgaW4gbm9uLXZpc3VhbC1tb2RlLlxuICAgICMgZS5nLiBgLmAgcmVwZWF0IG9mIG9wZXJhdGlvbiB0YXJnZXRlZCBibG9ja3dpc2UgYEN1cnJlbnRTZWxlY3Rpb25gLlxuICAgICMgV2UgbmVlZCB0byBtYW51YWxseSBjbGVhciBibG9ja3dpc2VTZWxlY3Rpb24uXG4gICAgIyBTZWUgIzY0N1xuICAgIEB2aW1TdGF0ZS5jbGVhckJsb2Nrd2lzZVNlbGVjdGlvbnMoKSAjIEZJWE1FLCBzaG91bGQgYmUgcmVtb3ZlZFxuICAgIGlmIGhhdmVTb21lTm9uRW1wdHlTZWxlY3Rpb24oQGVkaXRvcilcbiAgICAgIGlmIEB2aW1TdGF0ZS5nZXRDb25maWcoJ3N0cmljdEFzc2VydGlvbicpXG4gICAgICAgIGFzc2VydFdpdGhFeGNlcHRpb24oZmFsc2UsIFwiSGF2ZSBzb21lIG5vbi1lbXB0eSBzZWxlY3Rpb24gaW4gbm9ybWFsLW1vZGU6ICN7b3BlcmF0aW9uLnRvU3RyaW5nKCl9XCIpXG4gICAgICBAdmltU3RhdGUuY2xlYXJTZWxlY3Rpb25zKClcblxuICBlbnN1cmVBbGxDdXJzb3JzQXJlTm90QXRFbmRPZkxpbmU6IC0+XG4gICAgZm9yIGN1cnNvciBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKSB3aGVuIGN1cnNvci5pc0F0RW5kT2ZMaW5lKClcbiAgICAgIG1vdmVDdXJzb3JMZWZ0KGN1cnNvciwgcHJlc2VydmVHb2FsQ29sdW1uOiB0cnVlKVxuXG4gIGFkZFRvQ2xhc3NMaXN0OiAoY2xhc3NOYW1lKSAtPlxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKVxuICAgIEBzdWJzY3JpYmUgbmV3IERpc3Bvc2FibGUgPT5cbiAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NOYW1lKVxuXG4gICMgQ291bnRcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMga2V5c3Ryb2tlIGAzZDJ3YCBkZWxldGUgNigzKjIpIHdvcmRzLlxuICAjICAybmQgbnVtYmVyKDIgaW4gdGhpcyBjYXNlKSBpcyBhbHdheXMgZW50ZXJkIGluIG9wZXJhdG9yLXBlbmRpbmctbW9kZS5cbiAgIyAgU28gY291bnQgaGF2ZSB0d28gdGltaW5nIHRvIGJlIGVudGVyZWQuIHRoYXQncyB3aHkgaGVyZSB3ZSBtYW5hZ2UgY291bnRlciBieSBtb2RlLlxuICBoYXNDb3VudDogLT5cbiAgICBAY291bnRbJ25vcm1hbCddPyBvciBAY291bnRbJ29wZXJhdG9yLXBlbmRpbmcnXT9cblxuICBnZXRDb3VudDogLT5cbiAgICBpZiBAaGFzQ291bnQoKVxuICAgICAgKEBjb3VudFsnbm9ybWFsJ10gPyAxKSAqIChAY291bnRbJ29wZXJhdG9yLXBlbmRpbmcnXSA/IDEpXG4gICAgZWxzZVxuICAgICAgbnVsbFxuXG4gIHNldENvdW50OiAobnVtYmVyKSAtPlxuICAgIG1vZGUgPSAnbm9ybWFsJ1xuICAgIG1vZGUgPSBAbW9kZSBpZiBAbW9kZSBpcyAnb3BlcmF0b3ItcGVuZGluZydcbiAgICBAY291bnRbbW9kZV0gPz0gMFxuICAgIEBjb3VudFttb2RlXSA9IChAY291bnRbbW9kZV0gKiAxMCkgKyBudW1iZXJcbiAgICBAdmltU3RhdGUuaG92ZXIuc2V0KEBidWlsZENvdW50U3RyaW5nKCkpXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnd2l0aC1jb3VudCcsIHRydWUpXG5cbiAgYnVpbGRDb3VudFN0cmluZzogLT5cbiAgICBbQGNvdW50Wydub3JtYWwnXSwgQGNvdW50WydvcGVyYXRvci1wZW5kaW5nJ11dXG4gICAgICAuZmlsdGVyIChjb3VudCkgLT4gY291bnQ/XG4gICAgICAubWFwIChjb3VudCkgLT4gU3RyaW5nKGNvdW50KVxuICAgICAgLmpvaW4oJ3gnKVxuXG4gIHJlc2V0Q291bnQ6IC0+XG4gICAgQGNvdW50ID0ge31cbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCd3aXRoLWNvdW50JylcblxubW9kdWxlLmV4cG9ydHMgPSBPcGVyYXRpb25TdGFja1xuIl19
