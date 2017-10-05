(function() {
  var Range, RangeFinder;

  Range = require('atom').Range;

  module.exports = RangeFinder = (function() {
    RangeFinder.rangesFor = function(editor) {
      return new RangeFinder(editor).ranges();
    };

    function RangeFinder(editor1) {
      this.editor = editor1;
    }

    RangeFinder.prototype.ranges = function() {
      var selectionRanges;
      selectionRanges = this.selectionRanges();
      if (selectionRanges.length === 0) {
        return [this.sortableRangeForEntireBuffer()];
      } else {
        return selectionRanges.map((function(_this) {
          return function(selectionRange) {
            return _this.sortableRangeFrom(selectionRange);
          };
        })(this));
      }
    };

    RangeFinder.prototype.selectionRanges = function() {
      return this.editor.getSelectedBufferRanges().filter(function(range) {
        return !range.isEmpty();
      });
    };

    RangeFinder.prototype.sortableRangeForEntireBuffer = function() {
      return this.editor.getBuffer().getRange();
    };

    RangeFinder.prototype.sortableRangeFrom = function(selectionRange) {
      var endCol, endRow, startCol, startRow;
      startRow = selectionRange.start.row;
      startCol = 0;
      endRow = selectionRange.end.column === 0 ? selectionRange.end.row - 1 : selectionRange.end.row;
      endCol = this.editor.lineTextForBufferRow(endRow).length;
      return new Range([startRow, startCol], [endRow, endCol]);
    };

    return RangeFinder;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2FydHJlLy5hdG9tL3BhY2thZ2VzL2F0b20tcHJldHRpZnkvbGliL3JhbmdlLWZpbmRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLFFBQVMsT0FBQSxDQUFRLE1BQVI7O0VBRVYsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUVKLFdBQUMsQ0FBQSxTQUFELEdBQVksU0FBQyxNQUFEO2FBQ04sSUFBQSxXQUFBLENBQVksTUFBWixDQUFtQixDQUFDLE1BQXBCLENBQUE7SUFETTs7SUFJQyxxQkFBQyxPQUFEO01BQUMsSUFBQyxDQUFBLFNBQUQ7SUFBRDs7MEJBR2IsTUFBQSxHQUFRLFNBQUE7QUFDTixVQUFBO01BQUEsZUFBQSxHQUFrQixJQUFDLENBQUEsZUFBRCxDQUFBO01BQ2xCLElBQUcsZUFBZSxDQUFDLE1BQWhCLEtBQTBCLENBQTdCO2VBQ0UsQ0FBQyxJQUFDLENBQUEsNEJBQUQsQ0FBQSxDQUFELEVBREY7T0FBQSxNQUFBO2VBR0UsZUFBZSxDQUFDLEdBQWhCLENBQW9CLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsY0FBRDttQkFDbEIsS0FBQyxDQUFBLGlCQUFELENBQW1CLGNBQW5CO1VBRGtCO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQixFQUhGOztJQUZNOzswQkFTUixlQUFBLEdBQWlCLFNBQUE7YUFDZixJQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQUEsQ0FBaUMsQ0FBQyxNQUFsQyxDQUF5QyxTQUFDLEtBQUQ7ZUFDdkMsQ0FBSSxLQUFLLENBQUMsT0FBTixDQUFBO01BRG1DLENBQXpDO0lBRGU7OzBCQUtqQiw0QkFBQSxHQUE4QixTQUFBO2FBQzVCLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBUixDQUFBLENBQW1CLENBQUMsUUFBcEIsQ0FBQTtJQUQ0Qjs7MEJBSTlCLGlCQUFBLEdBQW1CLFNBQUMsY0FBRDtBQUNqQixVQUFBO01BQUEsUUFBQSxHQUFXLGNBQWMsQ0FBQyxLQUFLLENBQUM7TUFDaEMsUUFBQSxHQUFXO01BQ1gsTUFBQSxHQUFZLGNBQWMsQ0FBQyxHQUFHLENBQUMsTUFBbkIsS0FBNkIsQ0FBaEMsR0FDUCxjQUFjLENBQUMsR0FBRyxDQUFDLEdBQW5CLEdBQXlCLENBRGxCLEdBR1AsY0FBYyxDQUFDLEdBQUcsQ0FBQztNQUNyQixNQUFBLEdBQVMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxvQkFBUixDQUE2QixNQUE3QixDQUFvQyxDQUFDO2FBRTFDLElBQUEsS0FBQSxDQUFNLENBQUMsUUFBRCxFQUFXLFFBQVgsQ0FBTixFQUE0QixDQUFDLE1BQUQsRUFBUyxNQUFULENBQTVCO0lBVGE7Ozs7O0FBOUJyQiIsInNvdXJjZXNDb250ZW50IjpbIntSYW5nZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBSYW5nZUZpbmRlclxuICAjIFB1YmxpY1xuICBAcmFuZ2VzRm9yOiAoZWRpdG9yKSAtPlxuICAgIG5ldyBSYW5nZUZpbmRlcihlZGl0b3IpLnJhbmdlcygpXG5cbiAgIyBQdWJsaWNcbiAgY29uc3RydWN0b3I6IChAZWRpdG9yKSAtPlxuXG4gICMgUHVibGljXG4gIHJhbmdlczogLT5cbiAgICBzZWxlY3Rpb25SYW5nZXMgPSBAc2VsZWN0aW9uUmFuZ2VzKClcbiAgICBpZiBzZWxlY3Rpb25SYW5nZXMubGVuZ3RoIGlzIDBcbiAgICAgIFtAc29ydGFibGVSYW5nZUZvckVudGlyZUJ1ZmZlcigpXVxuICAgIGVsc2VcbiAgICAgIHNlbGVjdGlvblJhbmdlcy5tYXAgKHNlbGVjdGlvblJhbmdlKSA9PlxuICAgICAgICBAc29ydGFibGVSYW5nZUZyb20oc2VsZWN0aW9uUmFuZ2UpXG5cbiAgIyBJbnRlcm5hbFxuICBzZWxlY3Rpb25SYW5nZXM6IC0+XG4gICAgQGVkaXRvci5nZXRTZWxlY3RlZEJ1ZmZlclJhbmdlcygpLmZpbHRlciAocmFuZ2UpIC0+XG4gICAgICBub3QgcmFuZ2UuaXNFbXB0eSgpXG5cbiAgIyBJbnRlcm5hbFxuICBzb3J0YWJsZVJhbmdlRm9yRW50aXJlQnVmZmVyOiAtPlxuICAgIEBlZGl0b3IuZ2V0QnVmZmVyKCkuZ2V0UmFuZ2UoKVxuXG4gICMgSW50ZXJuYWxcbiAgc29ydGFibGVSYW5nZUZyb206IChzZWxlY3Rpb25SYW5nZSkgLT5cbiAgICBzdGFydFJvdyA9IHNlbGVjdGlvblJhbmdlLnN0YXJ0LnJvd1xuICAgIHN0YXJ0Q29sID0gMFxuICAgIGVuZFJvdyA9IGlmIHNlbGVjdGlvblJhbmdlLmVuZC5jb2x1bW4gPT0gMFxuICAgICAgc2VsZWN0aW9uUmFuZ2UuZW5kLnJvdyAtIDFcbiAgICBlbHNlXG4gICAgICBzZWxlY3Rpb25SYW5nZS5lbmQucm93XG4gICAgZW5kQ29sID0gQGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhlbmRSb3cpLmxlbmd0aFxuXG4gICAgbmV3IFJhbmdlIFtzdGFydFJvdywgc3RhcnRDb2xdLCBbZW5kUm93LCBlbmRDb2xdXG4iXX0=
