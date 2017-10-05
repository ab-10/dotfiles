(function() {
  var AtomTodoist;

  module.exports = AtomTodoist = (function() {
    function AtomTodoist(serializedState) {
      var callback, data, message;
      this.request = require('request');
      this.main = document.createElement('div');
      this.main.classList.add('atom-todoist');
      message = document.createElement('div');
      data = {
        url: "https://todoist.com/API/v7/sync",
        form: {
          token: atom.config.get('atom-todoist.token'),
          sync_token: '*',
          resource_types: '["all"]'
        }
      };
      callback = function(err, httpResponse, body) {
        var atom_projects, h4, i, input, j, k, l, label, line, line_parent, list, list_parent, m, n, parent, ref, ref1, ref2, ref3, text, todo_projects, todoist;
        todo_projects = [];
        todoist = JSON.parse(body);
        for (i = k = 0, ref = todoist.projects.length; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
          for (j = l = 0, ref1 = atom.project.getPaths().length; 0 <= ref1 ? l < ref1 : l > ref1; j = 0 <= ref1 ? ++l : --l) {
            atom_projects = atom.project.getPaths()[j].split("/");
            if (!todoist.projects[i].inbox_project && todoist.projects[i].name.toUpperCase() === atom_projects[atom_projects.length - 1].toUpperCase()) {
              todo_projects.push({
                id: todoist.projects[i].id,
                name: todoist.projects[i].name
              });
            }
          }
        }
        for (i = m = 0, ref2 = todo_projects.length; 0 <= ref2 ? m < ref2 : m > ref2; i = 0 <= ref2 ? ++m : --m) {
          for (j = n = 0, ref3 = todoist.items.length; 0 <= ref3 ? n < ref3 : n > ref3; j = 0 <= ref3 ? ++n : --n) {
            if (todoist.items[j].project_id === todo_projects[i].id) {
              if (document.getElementById(todo_projects[i].id.toString()) === null) {
                list_parent = document.createElement('ul');
                list_parent.setAttribute('id', todo_projects[i].id.toString() + "_parent");
                line_parent = document.createElement('li');
                h4 = document.createElement('h4');
                h4.textContent = todo_projects[i].name;
                line_parent.appendChild(h4);
                list = document.createElement('ul');
                list.setAttribute('id', todo_projects[i].id.toString());
                list_parent.appendChild(line_parent);
                list_parent.appendChild(list);
                message.appendChild(list_parent);
              }
              parent = document.getElementById(todo_projects[i].id.toString());
              line = document.createElement('li');
              input = document.createElement('input');
              input.setAttribute('type', 'checkbox');
              input.setAttribute('id', todoist.items[j].id.toString());
              input.checked = todoist.items[j].checked === 1;
              label = document.createElement('label');
              label.setAttribute('for', todoist.items[j].id.toString());
              text = document.createTextNode(" " + todoist.items[j].content);
              label.appendChild(input);
              label.appendChild(text);
              line.appendChild(label);
              parent.appendChild(line);
            }
          }
        }
        return message.classList.add('message');
      };
      this.request.post(data, callback);
      this.main.appendChild(message);
    }

    AtomTodoist.prototype.updateTasks = function() {
      var each, elements, processed, request, todos;
      elements = document.querySelectorAll("input[type=checkbox]");
      todos = '';
      processed = 0;
      request = this.request;
      each = function(el, i, arr) {
        var callback, data;
        if (el.checked) {
          if (todos === '') {
            todos = todos + el.getAttribute('id');
          } else {
            todos = todos + ',' + el.getAttribute('id');
          }
        }
        processed++;
        if (processed === arr.length) {
          data = {
            url: "https://todoist.com/API/v7/sync",
            form: {
              token: atom.config.get('atom-todoist.token'),
              commands: '[{"type": "item_delete", "uuid": "f8539c77-7fd7-4846-afad-3b201f0be8a5", "args": {"ids": [' + todos + ']}}]'
            }
          };
          callback = function(err, httpResponse, body) {
            return console.log(body);
          };
          return request.post(data, callback);
        }
      };
      return Array.prototype.forEach.call(elements, each);
    };

    AtomTodoist.prototype.serialize = function() {};

    AtomTodoist.prototype.destroy = function() {
      return this.main.remove();
    };

    AtomTodoist.prototype.getElement = function() {
      return this.main;
    };

    return AtomTodoist;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2FydHJlLy5hdG9tL3BhY2thZ2VzL2F0b20tdG9kb2lzdC9saWIvYXRvbS10b2RvaXN0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNXLHFCQUFDLGVBQUQ7QUFDVCxVQUFBO01BQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxPQUFBLENBQVEsU0FBUjtNQUNYLElBQUMsQ0FBQSxJQUFELEdBQVEsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkI7TUFDUixJQUFDLENBQUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFoQixDQUFvQixjQUFwQjtNQUNBLE9BQUEsR0FBVSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtNQUNWLElBQUEsR0FDSTtRQUFBLEdBQUEsRUFBTSxpQ0FBTjtRQUNBLElBQUEsRUFDSTtVQUFBLEtBQUEsRUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isb0JBQWhCLENBQVA7VUFDQSxVQUFBLEVBQVcsR0FEWDtVQUVBLGNBQUEsRUFBZSxTQUZmO1NBRko7O01BTUosUUFBQSxHQUFXLFNBQUMsR0FBRCxFQUFLLFlBQUwsRUFBa0IsSUFBbEI7QUFDUCxZQUFBO1FBQUEsYUFBQSxHQUFnQjtRQUNoQixPQUFBLEdBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFYO0FBQ1YsYUFBUyxnR0FBVDtBQUNFLGVBQVMsNEdBQVQ7WUFDRSxhQUFBLEdBQWdCLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFBLENBQXdCLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBM0IsQ0FBaUMsR0FBakM7WUFDaEIsSUFBRyxDQUFDLE9BQU8sQ0FBQyxRQUFTLENBQUEsQ0FBQSxDQUFFLENBQUMsYUFBckIsSUFBdUMsT0FBTyxDQUFDLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUFJLENBQUMsV0FBekIsQ0FBQSxDQUFBLEtBQTBDLGFBQWMsQ0FBQSxhQUFhLENBQUMsTUFBZCxHQUF1QixDQUF2QixDQUF5QixDQUFDLFdBQXhDLENBQUEsQ0FBcEY7Y0FDSSxhQUFhLENBQUMsSUFBZCxDQUFtQjtnQkFBQyxFQUFBLEVBQUksT0FBTyxDQUFDLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxFQUF6QjtnQkFBNkIsSUFBQSxFQUFNLE9BQU8sQ0FBQyxRQUFTLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBdkQ7ZUFBbkIsRUFESjs7QUFGRjtBQURGO0FBTUEsYUFBUyxrR0FBVDtBQUNJLGVBQVMsa0dBQVQ7WUFDSSxJQUFHLE9BQU8sQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsVUFBakIsS0FBK0IsYUFBYyxDQUFBLENBQUEsQ0FBRSxDQUFDLEVBQW5EO2NBQ0UsSUFBRyxRQUFRLENBQUMsY0FBVCxDQUF3QixhQUFjLENBQUEsQ0FBQSxDQUFFLENBQUMsRUFBRSxDQUFDLFFBQXBCLENBQUEsQ0FBeEIsQ0FBQSxLQUEyRCxJQUE5RDtnQkFDRSxXQUFBLEdBQWMsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsSUFBdkI7Z0JBQ2QsV0FBVyxDQUFDLFlBQVosQ0FBeUIsSUFBekIsRUFBK0IsYUFBYyxDQUFBLENBQUEsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxRQUFwQixDQUFBLENBQUEsR0FBaUMsU0FBaEU7Z0JBQ0EsV0FBQSxHQUFjLFFBQVEsQ0FBQyxhQUFULENBQXVCLElBQXZCO2dCQUNkLEVBQUEsR0FBSyxRQUFRLENBQUMsYUFBVCxDQUF1QixJQUF2QjtnQkFDTCxFQUFFLENBQUMsV0FBSCxHQUFpQixhQUFjLENBQUEsQ0FBQSxDQUFFLENBQUM7Z0JBQ2xDLFdBQVcsQ0FBQyxXQUFaLENBQXdCLEVBQXhCO2dCQUNBLElBQUEsR0FBTyxRQUFRLENBQUMsYUFBVCxDQUF1QixJQUF2QjtnQkFDUCxJQUFJLENBQUMsWUFBTCxDQUFrQixJQUFsQixFQUF3QixhQUFjLENBQUEsQ0FBQSxDQUFFLENBQUMsRUFBRSxDQUFDLFFBQXBCLENBQUEsQ0FBeEI7Z0JBQ0EsV0FBVyxDQUFDLFdBQVosQ0FBd0IsV0FBeEI7Z0JBQ0EsV0FBVyxDQUFDLFdBQVosQ0FBd0IsSUFBeEI7Z0JBQ0EsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsV0FBcEIsRUFYRjs7Y0FZQSxNQUFBLEdBQVMsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsYUFBYyxDQUFBLENBQUEsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxRQUFwQixDQUFBLENBQXhCO2NBQ1QsSUFBQSxHQUFPLFFBQVEsQ0FBQyxhQUFULENBQXVCLElBQXZCO2NBQ1AsS0FBQSxHQUFRLFFBQVEsQ0FBQyxhQUFULENBQXVCLE9BQXZCO2NBQ1IsS0FBSyxDQUFDLFlBQU4sQ0FBbUIsTUFBbkIsRUFBMkIsVUFBM0I7Y0FDQSxLQUFLLENBQUMsWUFBTixDQUFtQixJQUFuQixFQUF5QixPQUFPLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxRQUFwQixDQUFBLENBQXpCO2NBQ0EsS0FBSyxDQUFDLE9BQU4sR0FBZ0IsT0FBTyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxPQUFqQixLQUE0QjtjQUM1QyxLQUFBLEdBQVEsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsT0FBdkI7Y0FDUixLQUFLLENBQUMsWUFBTixDQUFtQixLQUFuQixFQUEwQixPQUFPLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxRQUFwQixDQUFBLENBQTFCO2NBQ0EsSUFBQSxHQUFPLFFBQVEsQ0FBQyxjQUFULENBQXdCLEdBQUEsR0FBTSxPQUFPLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQS9DO2NBQ1AsS0FBSyxDQUFDLFdBQU4sQ0FBa0IsS0FBbEI7Y0FDQSxLQUFLLENBQUMsV0FBTixDQUFrQixJQUFsQjtjQUNBLElBQUksQ0FBQyxXQUFMLENBQWlCLEtBQWpCO2NBQ0EsTUFBTSxDQUFDLFdBQVAsQ0FBbUIsSUFBbkIsRUF6QkY7O0FBREo7QUFESjtlQThCQSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQWxCLENBQXNCLFNBQXRCO01BdkNPO01Bd0NYLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLElBQWQsRUFBb0IsUUFBcEI7TUFFQSxJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsT0FBbEI7SUF0RFM7OzBCQTBEYixXQUFBLEdBQWEsU0FBQTtBQUNYLFVBQUE7TUFBQSxRQUFBLEdBQVcsUUFBUSxDQUFDLGdCQUFULENBQTBCLHNCQUExQjtNQUNYLEtBQUEsR0FBUTtNQUNSLFNBQUEsR0FBWTtNQUNaLE9BQUEsR0FBVSxJQUFDLENBQUE7TUFDWCxJQUFBLEdBQU8sU0FBQyxFQUFELEVBQUssQ0FBTCxFQUFRLEdBQVI7QUFDTCxZQUFBO1FBQUEsSUFBRyxFQUFFLENBQUMsT0FBTjtVQUNFLElBQUcsS0FBQSxLQUFTLEVBQVo7WUFDRSxLQUFBLEdBQVEsS0FBQSxHQUFRLEVBQUUsQ0FBQyxZQUFILENBQWdCLElBQWhCLEVBRGxCO1dBQUEsTUFBQTtZQUdFLEtBQUEsR0FBUSxLQUFBLEdBQVEsR0FBUixHQUFjLEVBQUUsQ0FBQyxZQUFILENBQWdCLElBQWhCLEVBSHhCO1dBREY7O1FBTUEsU0FBQTtRQUNBLElBQUcsU0FBQSxLQUFhLEdBQUcsQ0FBQyxNQUFwQjtVQUNFLElBQUEsR0FDRTtZQUFBLEdBQUEsRUFBTSxpQ0FBTjtZQUNBLElBQUEsRUFDSTtjQUFBLEtBQUEsRUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isb0JBQWhCLENBQVA7Y0FDQSxRQUFBLEVBQVUsNEZBQUEsR0FBK0YsS0FBL0YsR0FBdUcsTUFEakg7YUFGSjs7VUFJRixRQUFBLEdBQVcsU0FBQyxHQUFELEVBQUssWUFBTCxFQUFrQixJQUFsQjttQkFDVCxPQUFPLENBQUMsR0FBUixDQUFZLElBQVo7VUFEUztpQkFFWCxPQUFPLENBQUMsSUFBUixDQUFhLElBQWIsRUFBbUIsUUFBbkIsRUFSRjs7TUFSSzthQWlCUCxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUF4QixDQUE2QixRQUE3QixFQUF1QyxJQUF2QztJQXRCVzs7MEJBd0JiLFNBQUEsR0FBVyxTQUFBLEdBQUE7OzBCQUdYLE9BQUEsR0FBUyxTQUFBO2FBQ0wsSUFBQyxDQUFBLElBQUksQ0FBQyxNQUFOLENBQUE7SUFESzs7MEJBR1QsVUFBQSxHQUFZLFNBQUE7YUFDUixJQUFDLENBQUE7SUFETzs7Ozs7QUExRmhCIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgQXRvbVRvZG9pc3RcbiAgICBjb25zdHJ1Y3RvcjogKHNlcmlhbGl6ZWRTdGF0ZSkgLT5cbiAgICAgICAgQHJlcXVlc3QgPSByZXF1aXJlKCdyZXF1ZXN0JylcbiAgICAgICAgQG1haW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgICBAbWFpbi5jbGFzc0xpc3QuYWRkKCdhdG9tLXRvZG9pc3QnKVxuICAgICAgICBtZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICAgZGF0YSA9XG4gICAgICAgICAgICB1cmwgOiBcImh0dHBzOi8vdG9kb2lzdC5jb20vQVBJL3Y3L3N5bmNcIlxuICAgICAgICAgICAgZm9ybTpcbiAgICAgICAgICAgICAgICB0b2tlbjogYXRvbS5jb25maWcuZ2V0KCdhdG9tLXRvZG9pc3QudG9rZW4nKVxuICAgICAgICAgICAgICAgIHN5bmNfdG9rZW46JyonXG4gICAgICAgICAgICAgICAgcmVzb3VyY2VfdHlwZXM6J1tcImFsbFwiXSdcblxuICAgICAgICBjYWxsYmFjayA9IChlcnIsaHR0cFJlc3BvbnNlLGJvZHkpIC0+XG4gICAgICAgICAgICB0b2RvX3Byb2plY3RzID0gW11cbiAgICAgICAgICAgIHRvZG9pc3QgPSBKU09OLnBhcnNlKGJvZHkpXG4gICAgICAgICAgICBmb3IgaSBpbiBbMC4uLnRvZG9pc3QucHJvamVjdHMubGVuZ3RoXVxuICAgICAgICAgICAgICBmb3IgaiBpbiBbMC4uLmF0b20ucHJvamVjdC5nZXRQYXRocygpLmxlbmd0aF1cbiAgICAgICAgICAgICAgICBhdG9tX3Byb2plY3RzID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbal0uc3BsaXQoXCIvXCIpXG4gICAgICAgICAgICAgICAgaWYgIXRvZG9pc3QucHJvamVjdHNbaV0uaW5ib3hfcHJvamVjdCBhbmQgdG9kb2lzdC5wcm9qZWN0c1tpXS5uYW1lLnRvVXBwZXJDYXNlKCkgPT0gYXRvbV9wcm9qZWN0c1thdG9tX3Byb2plY3RzLmxlbmd0aCAtIDFdLnRvVXBwZXJDYXNlKClcbiAgICAgICAgICAgICAgICAgICAgdG9kb19wcm9qZWN0cy5wdXNoKHtpZDogdG9kb2lzdC5wcm9qZWN0c1tpXS5pZCwgbmFtZTogdG9kb2lzdC5wcm9qZWN0c1tpXS5uYW1lfSk7XG5cbiAgICAgICAgICAgIGZvciBpIGluIFswLi4udG9kb19wcm9qZWN0cy5sZW5ndGhdXG4gICAgICAgICAgICAgICAgZm9yIGogaW4gWzAuLi50b2RvaXN0Lml0ZW1zLmxlbmd0aF1cbiAgICAgICAgICAgICAgICAgICAgaWYgdG9kb2lzdC5pdGVtc1tqXS5wcm9qZWN0X2lkID09IHRvZG9fcHJvamVjdHNbaV0uaWRcbiAgICAgICAgICAgICAgICAgICAgICBpZiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0b2RvX3Byb2plY3RzW2ldLmlkLnRvU3RyaW5nKCkpID09IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RfcGFyZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKVxuICAgICAgICAgICAgICAgICAgICAgICAgbGlzdF9wYXJlbnQuc2V0QXR0cmlidXRlKCdpZCcsIHRvZG9fcHJvamVjdHNbaV0uaWQudG9TdHJpbmcoKSArIFwiX3BhcmVudFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZV9wYXJlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpXG4gICAgICAgICAgICAgICAgICAgICAgICBoNCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2g0JylcbiAgICAgICAgICAgICAgICAgICAgICAgIGg0LnRleHRDb250ZW50ID0gdG9kb19wcm9qZWN0c1tpXS5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lX3BhcmVudC5hcHBlbmRDaGlsZChoNCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKVxuICAgICAgICAgICAgICAgICAgICAgICAgbGlzdC5zZXRBdHRyaWJ1dGUoJ2lkJywgdG9kb19wcm9qZWN0c1tpXS5pZC50b1N0cmluZygpKVxuICAgICAgICAgICAgICAgICAgICAgICAgbGlzdF9wYXJlbnQuYXBwZW5kQ2hpbGQobGluZV9wYXJlbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICBsaXN0X3BhcmVudC5hcHBlbmRDaGlsZChsaXN0KVxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5hcHBlbmRDaGlsZChsaXN0X3BhcmVudClcbiAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0b2RvX3Byb2plY3RzW2ldLmlkLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAgICAgICAgICAgbGluZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJylcbiAgICAgICAgICAgICAgICAgICAgICBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0JylcbiAgICAgICAgICAgICAgICAgICAgICBpbnB1dC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAnY2hlY2tib3gnKVxuICAgICAgICAgICAgICAgICAgICAgIGlucHV0LnNldEF0dHJpYnV0ZSgnaWQnLCB0b2RvaXN0Lml0ZW1zW2pdLmlkLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAgICAgICAgICAgaW5wdXQuY2hlY2tlZCA9IHRvZG9pc3QuaXRlbXNbal0uY2hlY2tlZCA9PSAxXG4gICAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpXG4gICAgICAgICAgICAgICAgICAgICAgbGFiZWwuc2V0QXR0cmlidXRlKCdmb3InLCB0b2RvaXN0Lml0ZW1zW2pdLmlkLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICAgICAgICAgICAgdGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiIFwiICsgdG9kb2lzdC5pdGVtc1tqXS5jb250ZW50KVxuICAgICAgICAgICAgICAgICAgICAgIGxhYmVsLmFwcGVuZENoaWxkKGlucHV0KVxuICAgICAgICAgICAgICAgICAgICAgIGxhYmVsLmFwcGVuZENoaWxkKHRleHQpXG4gICAgICAgICAgICAgICAgICAgICAgbGluZS5hcHBlbmRDaGlsZChsYWJlbClcbiAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuYXBwZW5kQ2hpbGQobGluZSlcblxuXG4gICAgICAgICAgICBtZXNzYWdlLmNsYXNzTGlzdC5hZGQoJ21lc3NhZ2UnKVxuICAgICAgICBAcmVxdWVzdC5wb3N0KGRhdGEsIGNhbGxiYWNrKVxuXG4gICAgICAgIEBtYWluLmFwcGVuZENoaWxkKG1lc3NhZ2UpXG5cbiAgICAjIFJldHVybnMgYW4gb2JqZWN0IHRoYXQgY2FuIGJlIHJldHJpZXZlZCB3aGVuIHBhY2thZ2UgaXMgYWN0aXZhdGVkXG5cbiAgICB1cGRhdGVUYXNrczogLT5cbiAgICAgIGVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcImlucHV0W3R5cGU9Y2hlY2tib3hdXCIpO1xuICAgICAgdG9kb3MgPSAnJ1xuICAgICAgcHJvY2Vzc2VkID0gMFxuICAgICAgcmVxdWVzdCA9IEByZXF1ZXN0XG4gICAgICBlYWNoID0gKGVsLCBpLCBhcnIpIC0+XG4gICAgICAgIGlmIGVsLmNoZWNrZWRcbiAgICAgICAgICBpZiB0b2RvcyA9PSAnJ1xuICAgICAgICAgICAgdG9kb3MgPSB0b2RvcyArIGVsLmdldEF0dHJpYnV0ZSgnaWQnKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRvZG9zID0gdG9kb3MgKyAnLCcgKyBlbC5nZXRBdHRyaWJ1dGUoJ2lkJylcblxuICAgICAgICBwcm9jZXNzZWQrK1xuICAgICAgICBpZiBwcm9jZXNzZWQgPT0gYXJyLmxlbmd0aFxuICAgICAgICAgIGRhdGEgPVxuICAgICAgICAgICAgdXJsIDogXCJodHRwczovL3RvZG9pc3QuY29tL0FQSS92Ny9zeW5jXCJcbiAgICAgICAgICAgIGZvcm06XG4gICAgICAgICAgICAgICAgdG9rZW46IGF0b20uY29uZmlnLmdldCgnYXRvbS10b2RvaXN0LnRva2VuJylcbiAgICAgICAgICAgICAgICBjb21tYW5kczogJ1t7XCJ0eXBlXCI6IFwiaXRlbV9kZWxldGVcIiwgXCJ1dWlkXCI6IFwiZjg1MzljNzctN2ZkNy00ODQ2LWFmYWQtM2IyMDFmMGJlOGE1XCIsIFwiYXJnc1wiOiB7XCJpZHNcIjogWycgKyB0b2RvcyArICddfX1dJ1xuICAgICAgICAgIGNhbGxiYWNrID0gKGVycixodHRwUmVzcG9uc2UsYm9keSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGJvZHkpXG4gICAgICAgICAgcmVxdWVzdC5wb3N0KGRhdGEsIGNhbGxiYWNrKVxuICAgICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChlbGVtZW50cywgZWFjaCk7XG5cbiAgICBzZXJpYWxpemU6IC0+XG5cbiAgICAjIFRlYXIgZG93biBhbnkgc3RhdGUgYW5kIGRldGFjaFxuICAgIGRlc3Ryb3k6IC0+XG4gICAgICAgIEBtYWluLnJlbW92ZSgpXG5cbiAgICBnZXRFbGVtZW50OiAtPlxuICAgICAgICBAbWFpblxuIl19
