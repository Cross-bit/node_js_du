const { kMaxLength } = require("buffer");
const { hasUncaughtExceptionCaptureCallback } = require("process");
const { resourceLimits } = require("worker_threads");

function preprocessGalleryData(imgData)
{
	var underlyingGraph = createUnderlyingGraph(imgData);
	var components = findWeakComponents(underlyingGraph);
	
	// sort similar components
	sortSimilarComponents(components, imgData);

	// sort blocks
	sortComponents(components, imgData);


	// group nonsimilar images
	var finalGrouping = groupSingleComponents(components)


	return finalGrouping;
}

function createUnderlyingGraph(imgData){
	var completeSimilarGraph = new Map();

	imgData.forEach(img => {
		completeSimilarGraph.set(img, new Set());
	});

	imgData.forEach(img => {
		var node = completeSimilarGraph.get(img);
		img.similar.forEach( neighbour => {

				// add original edge
				node.add(neighbour);
				// add other edge
				var neighbourInGraph = completeSimilarGraph.get(neighbour);
				
				if(!neighbourInGraph.has(img))
					neighbourInGraph.add(img);
			} );
	})

	return completeSimilarGraph;
}

function findWeakComponents (imgDataGraph) {

	var graphData = new Map(imgDataGraph);
	
	
	
	components = [];
	
	while(graphData.size > 0) {

		currentComponent = new Set();

		var stack = [];
		stack.push(graphData.keys().next().value);

		while (stack.length > 0) {

			var cur = stack.pop();
			
			currentComponent.add(cur);

			// mark as done in graph
			var neighbours = graphData.get(cur)

			if (neighbours !== undefined)
				for (let neighbour of neighbours) {
					if(!currentComponent.has(neighbour))
						stack.push(neighbour);
				}
			
			graphData.delete(cur);
		}

		// sort the component
		var componentsArr = [...currentComponent];
		components.push(componentsArr);
	}	
	return components;
}

function sortSimilarComponents(components, imgData){

	components.forEach(component => {

		component.sort ((a, b) => {
			
			var dateObja = new Date(a.created);
			var dateObjb = new Date(b.created);
			
			var time_a = dateObja.getTime();
			var time_b = dateObjb.getTime();	

			return sortingFunction(time_a, time_b, imgData);
		});
	})
}

function sortComponents(components, imgData){
	components.sort((a, b) => {
		var dateObja = new Date(a[0].created);
		var dateObjb = new Date(b[0].created);
		
		var time_a = dateObja.getTime();
		var time_b = dateObjb.getTime();

		return sortingFunction(time_a, time_b, imgData);

	})
}

function sortingFunction(time_a, time_b, imgData){
	if (time_a < time_b)
		return -1
	else if (time_a > time_b) {
		return 1
	} else {
		// expects that this will not happen too often, so linear search is ok
		index_a = imgData.indexOf(a);
		index_b = imgData.indexOf(b);

		if (index_a < index_b)
			return -1
		if (index_a > index_b)
			return 1
		else
			return 0;
	}
}

function groupSingleComponents(components) {

	var result = [];

	var currentNonsimilar = []
	for(component of components){
		if(component.length > 1) {
			if(currentNonsimilar.length != 0) {
				result.push(currentNonsimilar);
				currentNonsimilar = [];
			}
			result.push(component);
		}else if (component.length == 1){
			currentNonsimilar.push(component[0]);
		}

	}
	// some nonsimilar left
	if(currentNonsimilar.length != 0)
		result.push(currentNonsimilar);

	return result;
}

// In nodejs, this is the way how export is performed.
// In browser, module has to be a global varibale object.
module.exports = { preprocessGalleryData };

