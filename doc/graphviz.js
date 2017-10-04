const graphviz = require('graphviz');
const machine = require('../src/machine')();
const _ = require('lodash');

let graph = graphviz.digraph("G");

_.forEach(machine.states, (state, sourceState) => {
	graph.addNode(sourceState);
	_.forEach(state.answers, (answer, key) => {
		let edge = graph.addEdge(sourceState, answer.targetState);
		if (answer.name && answer.name != '') {
			edge.set('label', answer.name);
		}
	});
});


// console.log(graph.to_dot());
// require('fs').writeFile(__dirname + '/machine.graph', graph.to_dot(), (err, data) => {
// 	console.log('file written');
// });

graph.output("png", __dirname + "/machine.png");
