(function() {
  var CompositeDisposable, LineNumberView;

  LineNumberView = require('./line-number-view');

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = {
    config: {
      trueNumberCurrentLine: {
        type: 'boolean',
        "default": true,
        description: 'Show the true number on the current line'
      },
      showAbsoluteNumbers: {
        type: 'boolean',
        "default": false,
        description: 'Show absolute line numbers too?'
      },
      startAtOne: {
        type: 'boolean',
        "default": false,
        description: 'Start relative line numbering at one'
      },
      softWrapsCount: {
        type: 'boolean',
        "default": true,
        description: 'Do soft-wrapped lines count? (No in vim-mode-plus, yes in vim-mode)'
      }
    },
    configDefaults: {
      trueNumberCurrentLine: true,
      showAbsoluteNumbers: false,
      startAtOne: false
    },
    subscriptions: null,
    activate: function(state) {
      this.subscriptions = new CompositeDisposable;
      return this.subscriptions.add(atom.workspace.observeTextEditors(function(editor) {
        if (!editor.gutterWithName('relative-numbers')) {
          return new LineNumberView(editor);
        }
      }));
    },
    deactivate: function() {
      var editor, i, len, ref, ref1, results;
      this.subscriptions.dispose();
      ref = atom.workspace.getTextEditors();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        editor = ref[i];
        results.push((ref1 = editor.gutterWithName('relative-numbers').view) != null ? ref1.destroy() : void 0);
      }
      return results;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2FydHJlLy5hdG9tL3BhY2thZ2VzL3JlbGF0aXZlLW51bWJlcnMvbGliL3JlbGF0aXZlLW51bWJlcnMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxjQUFBLEdBQWlCLE9BQUEsQ0FBUSxvQkFBUjs7RUFDaEIsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUV4QixNQUFNLENBQUMsT0FBUCxHQUVFO0lBQUEsTUFBQSxFQUNFO01BQUEscUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsV0FBQSxFQUFhLDBDQUZiO09BREY7TUFJQSxtQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7UUFFQSxXQUFBLEVBQWEsaUNBRmI7T0FMRjtNQVFBLFVBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO1FBRUEsV0FBQSxFQUFhLHNDQUZiO09BVEY7TUFZQSxjQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtRQUVBLFdBQUEsRUFBYSxxRUFGYjtPQWJGO0tBREY7SUFrQkEsY0FBQSxFQUNFO01BQUEscUJBQUEsRUFBdUIsSUFBdkI7TUFDQSxtQkFBQSxFQUFxQixLQURyQjtNQUVBLFVBQUEsRUFBWSxLQUZaO0tBbkJGO0lBdUJBLGFBQUEsRUFBZSxJQXZCZjtJQXlCQSxRQUFBLEVBQVUsU0FBQyxLQUFEO01BQ1IsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSTthQUNyQixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBZixDQUFrQyxTQUFDLE1BQUQ7UUFDbkQsSUFBRyxDQUFJLE1BQU0sQ0FBQyxjQUFQLENBQXNCLGtCQUF0QixDQUFQO2lCQUNNLElBQUEsY0FBQSxDQUFlLE1BQWYsRUFETjs7TUFEbUQsQ0FBbEMsQ0FBbkI7SUFGUSxDQXpCVjtJQStCQSxVQUFBLEVBQVksU0FBQTtBQUNWLFVBQUE7TUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQTtBQUNBO0FBQUE7V0FBQSxxQ0FBQTs7MkZBQ2dELENBQUUsT0FBaEQsQ0FBQTtBQURGOztJQUZVLENBL0JaOztBQUxGIiwic291cmNlc0NvbnRlbnQiOlsiTGluZU51bWJlclZpZXcgPSByZXF1aXJlICcuL2xpbmUtbnVtYmVyLXZpZXcnXG57Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gICMgQ29uZmlnIHNjaGVtYVxuICBjb25maWc6XG4gICAgdHJ1ZU51bWJlckN1cnJlbnRMaW5lOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBkZXNjcmlwdGlvbjogJ1Nob3cgdGhlIHRydWUgbnVtYmVyIG9uIHRoZSBjdXJyZW50IGxpbmUnXG4gICAgc2hvd0Fic29sdXRlTnVtYmVyczpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2hvdyBhYnNvbHV0ZSBsaW5lIG51bWJlcnMgdG9vPydcbiAgICBzdGFydEF0T25lOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgZGVzY3JpcHRpb246ICdTdGFydCByZWxhdGl2ZSBsaW5lIG51bWJlcmluZyBhdCBvbmUnXG4gICAgc29mdFdyYXBzQ291bnQ6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIGRlc2NyaXB0aW9uOiAnRG8gc29mdC13cmFwcGVkIGxpbmVzIGNvdW50PyAoTm8gaW4gdmltLW1vZGUtcGx1cywgeWVzIGluIHZpbS1tb2RlKSdcblxuICBjb25maWdEZWZhdWx0czpcbiAgICB0cnVlTnVtYmVyQ3VycmVudExpbmU6IHRydWVcbiAgICBzaG93QWJzb2x1dGVOdW1iZXJzOiBmYWxzZVxuICAgIHN0YXJ0QXRPbmU6IGZhbHNlXG5cbiAgc3Vic2NyaXB0aW9uczogbnVsbFxuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMgKGVkaXRvcikgLT5cbiAgICAgIGlmIG5vdCBlZGl0b3IuZ3V0dGVyV2l0aE5hbWUoJ3JlbGF0aXZlLW51bWJlcnMnKVxuICAgICAgICBuZXcgTGluZU51bWJlclZpZXcoZWRpdG9yKVxuXG4gIGRlYWN0aXZhdGU6ICgpIC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgZm9yIGVkaXRvciBpbiBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpXG4gICAgICBlZGl0b3IuZ3V0dGVyV2l0aE5hbWUoJ3JlbGF0aXZlLW51bWJlcnMnKS52aWV3Py5kZXN0cm95KClcbiJdfQ==
