
// Global namespace object
var GB = window.GB || {};



//===================================================================
//
// Namespace: Math
//
//===================================================================
GB.Math = function()
{
	var ENUM = {add: '+', subtract: '-'};
	var _defaults = {
		addition: true,
		subtraction: true,
		lower: 1,
		upper: 100,
		min: 0,
		max: 100,
		limit: 30,
		randomize: true,
		carry: false,
		responsive: true,
		answers: false
	};

	$(document).ready(init);

	//---------------------------------------------------------------
	function init()
	{
		console.log('GB.Math.init');

		bindEvents();
		setDefaults();
		var options = getOptions();

		var matrix = buildMatrix(options);
		displayMatrix(matrix, options);

		updateSummary();
	}

	//--------------------------------------------------------------
	function bindEvents()
	{
		console.log('GB.Math.bindEvents');

		$('#options').on('submit', applyOptions);
		$('#numbers').on('change', 'input', updateAnswer);
	}

	//--------------------------------------------------------------
	function applyOptions(e)
	{
		console.log('GB.Math.applyOptions');

		e.preventDefault();
	}

	//--------------------------------------------------------------
	function updateAnswer(e)
	{
		console.log('GB.Math.updateAnswer');

		var $target = $(e.target);

		$target.removeClass('answer-correct');
		$target.removeClass('answer-incorrect');

		if ($target.val().length) {
			if (parseInt($target.val()) === parseInt($target.attr('data-answer'))) {
				$target.addClass('answer-correct');
			}
			else {
				$target.addClass('answer-incorrect');
			}
		}

		updateSummary();
	}

	//--------------------------------------------------------------
	function updateSummary()
	{
		console.log('GB.Math.updateSummary');

		var numbers = {
			total: $('.answer').length,
			right: $('.answer-correct').length,
			wrong: $('.answer-incorrect').length
		};

		var html = [];
		html.push("<li>Number of problems: " + numbers.total + "</li>");
		if (numbers.right) {
			html.push("<li>Number correct: " + numbers.right + "</li>");
		}
		if (numbers.wrong) {
			html.push("<li>Number incorrect: " + numbers.wrong + "</li>");
		}

		$('#summary').html(html.join(''));
	}

	//--------------------------------------------------------------
	function setDefaults()
	{
		console.log('GB.Math.setDefaults');

		var inputs = ['lower','upper','min','max','limit'];
		inputs.forEach(function(name) {
			$('[name=' + name + ']').val(_defaults[name]);
		});

		var checkboxes = ['addition','subtraction','randomize','carry','responsive','answers'];
		checkboxes.forEach(function(name) {
			$('[name=' + name + ']').prop('checked', _defaults[name]);
		});
	}

	//--------------------------------------------------------------
	function getOptions()
	{
		console.log('GB.Math.getOptions');

		var options = {
			lower: parseInt($('[name=lower]').val()),
			upper: parseInt($('[name=upper]').val()),
			min: parseInt($('[name=min]').val()),
			max: parseInt($('[name=max]').val()),
			limit: parseInt($('[name=limit]').val()),
			addition: $('[name=addition]').is(':checked'),
			subtraction: $('[name=subtraction]').is(':checked'),
			randomize: $('[name=randomize]').is(':checked'),
			carry: $('[name=carry]').is(':checked'),
			responsive: $('[name=responsive]').is(':checked'),
			answers: $('[name=answers]').is(':checked'),
		};

		$('body').toggleClass('option-responsive', options.responsive);

		return options;
	}

	//---------------------------------------------------------------
	function buildMatrix(options)
	{
		console.log('GB.Math.buildMatrix');
		console.log(options);

		var matrix = [];
		for (var i = options.lower; i <= options.upper; i++) {
			for (var j = options.lower; j <= options.upper; j++) {
				matrix.push({operation: getOperation(options), terms: [i, j]});
			}
		}

		// Remove items that exceed min/max values
		matrix = limitMinMax(matrix, options);

		// Remoevd items that require carrying
		if (!options.carry) {
			matrix = removeCarry(matrix);
		}

		// Randomize matrix array
		if (options.randomize) {
			matrix = shuffle(matrix);
		}

		// Reduce number of results to limit
		if (options.limit > 0) {
			matrix = matrix.slice(0, options.limit);
		}

		return matrix;
	}

	//---------------------------------------------------------------
	function getOperation(options)
	{
		if (options.addition && options.subtraction) {
			return Math.random() < 0.5 ? ENUM.subtract : ENUM.add;
		}
		else if (options.subtraction) {
			return ENUM.subtract;
		}
		else {
			return ENUM.add;
		}
	}

	//---------------------------------------------------------------
	function limitMinMax(matrix, options)
	{
		console.log('GB.Math.limitMinMax');

		var store = [];

		matrix.forEach(function(item) {
			if (item.operation === ENUM.add && (item.terms[0] + item.terms[1]) <= options.max) {
				store.push(item);
			}
			else if (item.operation === ENUM.subtract && (item.terms[0] - item.terms[1]) >= options.min) {
				store.push(item);
			}
		});

		return store;
	}

	//---------------------------------------------------------------
	function removeCarry(matrix)
	{
		console.log('GB.Math.removeCarry');

		var store = [];

		// Loop through all terms in the matrix
		matrix.forEach(function(item) {
			// Add individual digits of each term
			var compare = [];
			item.terms.forEach(function(number) {
				var digits = number.toString().split('').reverse();
				digits.forEach(function(value, index) {
					if (typeof compare[index] === 'undefined') {
						compare[index] = parseInt(value);
					}
					else if (item.operation === ENUM.subtract) {
						compare[index] -= parseInt(value);
					}
					else {
						compare[index] += parseInt(value);
					}
				});
			});

			// Check if any of the term additions are > 9 or < 0 (i.e. require carrying)
			var isCarry = false;
			compare.forEach(function(value) {
				if (value > 9 || value < 0) {
					isCarry = true;
				}
			});

			if (!isCarry) {
				store.push(item);
			}
		});

		return store;
	}

	//---------------------------------------------------------------
	function displayMatrix(matrix, options)
	{
		console.log('GB.Math.displayMatrix');

		var html = [];
		matrix.forEach(function(item) {
			var answer = item.operation === ENUM.subtract
				? item.terms[0] - item.terms[1]
				: item.terms[0] + item.terms[1];
			var input = "<input type='text' class='answer' data-answer='" + answer + "' value='" + (options.answers ? answer : '') + "' maxlength='" + answer.toString().length + "' />";
			html.push("<li class='terms'>" + item.terms[0] + " " + item.operation + " " + item.terms[1] + " = " + input + "</li>");
		});

		$('#numbers').append(html.join(''));
	}

	//---------------------------------------------------------------
	// http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
	function shuffle(array)
	{
		console.log('GB.Math.shuffle');

	  var currentIndex = array.length;

	  // While there remain elements to shuffle...
	  while (currentIndex !== 0) {
	    // Pick a remaining element...
	    var randomIndex = Math.floor(Math.random() * currentIndex);
	    currentIndex -= 1;

	    // And swap it with the current element.
	    var tempValue = array[currentIndex];
	    array[currentIndex] = array[randomIndex];
	    array[randomIndex] = tempValue;
	  }

	  return array;
	}
}();
