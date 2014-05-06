var nrects = 1;
function Rect() {
	var self = this;
	self.x = ko.observable(0);
	self.y = ko.observable(0);
	self.w = ko.observable(100);
	self.h = ko.observable(100);
	self.name = ko.observable("rect" + nrects++);
	self.rect = ko.computed(function(){
	            // In our case it doesn't matter we return; this function just needs to be
				// something that reads the values of the properties we're interested in
				return {x:self.x(), y:self.y(), w:self.w(), h:self.h()};
			});
};

function ViewModel() {
	var self = this;
	self.rects = ko.observableArray([]);
	self.addRect = function () {
		self.rects.push(new Rect(self));
	};
};

var drag = d3.behavior.drag()
.origin(Object)
.on("drag", function (d) {
            	// Update the view model
            	d.x(parseInt(d.x()) + d3.event.dx);
            	d.y(parseInt(d.y()) + d3.event.dy);
            });

window.onload = function() {
	var vm = new ViewModel();
	ko.applyBindings(vm);

	function update(data) {
                // Join elements with data
                var rects = d3.select("#svg")
                .selectAll("rect")
                .data(data, function (d) { return d.name(); });
                // Create new elements by transitioning them in
                rects.enter()
                .append("rect")
                .attr("id", function (d) { return d.name(); })
                .attr("opacity", 0.0)
                .transition()
                .duration(1000)
                .attr("opacity", 0.5);
                // Update existing ones by setting their x, y, etc
                rects.attr("x", function (d) { return d.x(); })
                .attr("y", function (d) { return d.y(); })
                .attr("width", function (d) { return d.w(); })
                .attr("height", function (d) { return d.h(); });
                // .call(drag);
                rects.exit().remove();
            }

            var subs = []; // for keeping track of subscriptions
            // Listen for changes to the view model data...
            vm.rects.subscribe(function (newValue) {
            	update(newValue);
                // Dispose any existing subscriptions 
                ko.utils.arrayForEach(subs, function (sub) { sub.dispose(); });
                // And create new ones...
                ko.utils.arrayForEach(newValue, function (item) {
                	subs.push(item.rect.subscribe(function () {
                		update(newValue);
                	}));
                });
            });
            // Add one to get us started
            vm.rects.push(new Rect());
        };