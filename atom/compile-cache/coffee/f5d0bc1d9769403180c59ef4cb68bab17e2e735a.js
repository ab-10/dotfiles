(function() {
  var RangeFinder, beautify, prettify;

  RangeFinder = require('./range-finder');

  beautify = require('js-beautify').html;

  module.exports = {
    activate: function() {
      return atom.commands.add('atom-text-editor', {
        'prettify:prettify': function(event) {
          var editor;
          editor = this.getModel();
          return prettify(editor);
        }
      });
    }
  };

  prettify = function(editor) {
    var sortableRanges;
    sortableRanges = RangeFinder.rangesFor(editor);
    return sortableRanges.forEach(function(range) {
      var text;
      text = editor.getTextInBufferRange(range);
      text = beautify(text, {
        'indent_size': atom.config.get('editor.tabLength')
      });
      return editor.setTextInBufferRange(range, text);
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2FydHJlLy5hdG9tL3BhY2thZ2VzL2F0b20tcHJldHRpZnkvbGliL3ByZXR0aWZ5LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUjs7RUFDZCxRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVIsQ0FBc0IsQ0FBQzs7RUFFbEMsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFFBQUEsRUFBVSxTQUFBO2FBQ1IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGtCQUFsQixFQUFzQztRQUFBLG1CQUFBLEVBQXFCLFNBQUMsS0FBRDtBQUN6RCxjQUFBO1VBQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxRQUFELENBQUE7aUJBQ1QsUUFBQSxDQUFTLE1BQVQ7UUFGeUQsQ0FBckI7T0FBdEM7SUFEUSxDQUFWOzs7RUFLRixRQUFBLEdBQVcsU0FBQyxNQUFEO0FBQ1QsUUFBQTtJQUFBLGNBQUEsR0FBaUIsV0FBVyxDQUFDLFNBQVosQ0FBc0IsTUFBdEI7V0FDakIsY0FBYyxDQUFDLE9BQWYsQ0FBdUIsU0FBQyxLQUFEO0FBQ3JCLFVBQUE7TUFBQSxJQUFBLEdBQU8sTUFBTSxDQUFDLG9CQUFQLENBQTRCLEtBQTVCO01BQ1AsSUFBQSxHQUFPLFFBQUEsQ0FBUyxJQUFULEVBQ0w7UUFBQSxhQUFBLEVBQWUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGtCQUFoQixDQUFmO09BREs7YUFFUCxNQUFNLENBQUMsb0JBQVAsQ0FBNEIsS0FBNUIsRUFBbUMsSUFBbkM7SUFKcUIsQ0FBdkI7RUFGUztBQVRYIiwic291cmNlc0NvbnRlbnQiOlsiUmFuZ2VGaW5kZXIgPSByZXF1aXJlICcuL3JhbmdlLWZpbmRlcidcbmJlYXV0aWZ5ID0gcmVxdWlyZSgnanMtYmVhdXRpZnknKS5odG1sXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgYWN0aXZhdGU6IC0+XG4gICAgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20tdGV4dC1lZGl0b3InLCAncHJldHRpZnk6cHJldHRpZnknOiAoZXZlbnQpIC0+XG4gICAgICBlZGl0b3IgPSBAZ2V0TW9kZWwoKVxuICAgICAgcHJldHRpZnkoZWRpdG9yKVxuXG5wcmV0dGlmeSA9IChlZGl0b3IpIC0+XG4gIHNvcnRhYmxlUmFuZ2VzID0gUmFuZ2VGaW5kZXIucmFuZ2VzRm9yKGVkaXRvcilcbiAgc29ydGFibGVSYW5nZXMuZm9yRWFjaCAocmFuZ2UpIC0+XG4gICAgdGV4dCA9IGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSlcbiAgICB0ZXh0ID0gYmVhdXRpZnkgdGV4dCxcbiAgICAgICdpbmRlbnRfc2l6ZSc6IGF0b20uY29uZmlnLmdldCgnZWRpdG9yLnRhYkxlbmd0aCcpXG4gICAgZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlLCB0ZXh0KVxuIl19
