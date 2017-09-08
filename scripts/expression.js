//Expression.js


//VARIAVEIS GLOBAIS-------------------------------------------------------------
var inputPoints = [ ];
//armazena os pontos de entrada. é global pois é de interesse de muitos métodos
//da regressão simbólica, assim como métodos futuros para plotar os pontos no
//gráfico.

var expressionSize = 1;
//representa o número de termos que a expressão terá.

var exponentRange = 3;
//o intervalo que as potências das variáveis poderão assumir. isso é controlado
//para evitar números absurdos. 

//variáveis do canvas
var canvas;
var ctx;

//CLASSES-----------------------------------------------------------------------
var DataPoint = function(x, y){

	//dataPoint é a estrutura que armazena cada ponto de entrada 
	//(x0, x1, ..., xn) e seu respectivo valor alvo y. É importante
	//que o x passado seja um array: new DataPoint([0, 1, 2, 3], 4).

	this.x = x;
	this.y = y;
	this.size = x.size;
}

var SimpleFunction = function(){

	//a expressão é feita com uma composição de funções. esta classe
	//representa uma função menor que é usada para a composição da ex-
	//pressão final. a informação contida é: expoêntes das n variáveis
	//e uma operação à ser realizada com o produto das n variáveis ele-
	//vadas aos seus respectivos expoentes:
	//([0, 1, 3, 5], sin) = sen(x0^0 * x1^1 * x2^3 * x3^5)

	this.variablesSize = inputPoints[0].x.length;
	this.exponents = [ ];

	for (var i=0; i< this.variablesSize; i++)
		this.exponents.push( getRandomInt(-exponentRange, exponentRange) );

	this.operation = getRandomOperation();
}

var Expression = function(size){

	//classe que representa a função final, onde é feita a composição
	//com as funções menores. Aqui as variáveis globais têm efeito na
	//criação da expressão. A composição é feita multiplicando cada um
	//dos termos por uma constante w, que tem seu valor ajustado duran-
	//te a execução por um algoritmo de regressão linear; e por fim 
	//somando o resultado de cada uma das funções menores (g(), h(), ...):
	//f(x, y, ...) = w0*g(x, y, ...) + w1*f(x, y, ...) + ...

	//inicializando
	this.coefficients = [ ];
	this.equation = [ ];
	this.mse = 0.0;
	this.equationSize = size;

	for (var i=0; i<this.equationSize; i++){
		this.equation.push(new SimpleFunction());
		this.coefficients.push(1.0);
	}

	this.adjustCoefficients();
	this.mse = this.calculateMSE();
}


//IMPLEMENTAÇÃO DE MÉTODOS DAS CLASSES------------------------------------------
SimpleFunction.prototype.getStringExpression_d = function() {

	//método que retorna uma string contendo a função menor.

	var expression = this.operation + "(";
	for (var i=0; i<this.variablesSize; i++){
		expression +=  "x" + i + "^" + this.exponents[i] + (i<this.exponents.length-1? " * " : "");
	}
	return (expression + ")");
}

SimpleFunction.prototype.evaluateSimpleFunction = function(x){

	//realizo o cálculo da equação menor

	var value = 1.0;

	for(var i=0; i<x.length; i++){
		value *= Math.pow(x[i], this.exponents[i]);
	}

	switch (this.operation){
		case "id": //identidade
			return value;
		case "sin": //seno
			return Math.sin(value);
		case "cos": //cosseno
			return Math.cos(value);
		case "tan": //tangente
			return Math.tan(value);
		case "abs": //módulo
			return value<0 ? -value: value;
		case "sqrt": //raiz quadrada
			return Math.sqrt(value);
		case "exp": //exponencial
			return Math.exp( Math.floor(value) );
		case "log": //log 
			return Math.log(value);
		default:
			alert("PROBLEMA EM EVALUATESIMPLEFUNCTIOn");
	}
}

Expression.prototype.getStringExpression_d = function(){

	//método que retorna uma string equivalente à expressão completa,
	//incluindo os coeficientes multiplicando suas respectivas funções
	//menores.

	var expression = "";
	for (var i=0; i<this.equationSize; i++){
		expression += "w" + i + "*" + this.equation[i].getStringExpression_d() + (i<this.equationSize-1? " + " : "");
	}
	return expression;
}

Expression.prototype.adjustCoefficients = function(){

	//aqui uso uma regressão linear para ajustar os coeficientes dos
	//pequenos termos.
	
	console.log("Ajustando coeficientes");
}

Expression.prototype.calculateMSE = function(){

	//calculo do mse

	this.mse = 0.0;

	for (var i=0; i<inputPoints.length; i++){
		var expressionValue = 0.0;

		for(var j=0; j<this.equationSize; j++){
			//multiplico cada um dos coeficientes pela resolução da eq.
			expressionValue += this.coefficients[j]*this.equation[j].evaluateSimpleFunction(inputPoints[i].x);
		}

		this.mse += Math.pow(inputPoints[i].y - expressionValue, 2);
	}

	console.log("Calculando mse");
	this.mse = Math.sqrt(this.mse/inputPoints.length);
	console.log(this.mse);

	if (this.mse == 0.0)
		console.log("EITA GIOVANA");

	return this.mse;
}

Expression.prototype.evaluateExpression = function(){

	//aqui a expressão é avaliada: 
	
	this.adjustCoefficients();
	this.calculateMSE();
	
	return this.mse;
}

//FUNÇÕES DA PÁGINA-------------------------------------------------------------
function getRandomInt(min, max) {

	//função que recebe um intervalo de números inteiros (min e max)
	//e retorna um número inteiro aleatório entre eles (incluíndo o
	// min e max).

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomOperation(){

	//função que sorteia um operador aleatório para uma função menor.
	//a identidade também atua como a multiplicação dos termos; e a
	//divisão ocorre quando um termo é elevado à um número negativo,
	//assim, as quatro operações básicas estão inclusas (+, -, /, *).
	//funções trigonométricas, raiz, exponencial, logarítmo e módulo
	//também foram incluidas na lista.

	switch(getRandomInt(0, 7)){
		case 0: //identidade
			return "id";
		case 1: //seno
			return "sin";
		case 2: //cosseno
			return "cos";
		case 3: //tangente
			return "tan";
		case 4: //módulo
			return "abs";
		case 5: //raiz quadrada
			return "sqrt";
		case 6: //exponencial
			return "exp";
		case 7: //log 
			return "log";
		default:
			alert("PROBLEMA EM GETRANDOMOPERATION");
	}
}

function setup(){

	//configura o canvas para desenhos e plot do gráfico. transforma os 
	//dados lidos em um array de dataPoint.

	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");

	ctx.canvas.width  = window.innerWidth;
  	ctx.canvas.height = window.innerHeight;

	  inputPoints = linesToDataPoint();
	  console.log(inputPoints);
}

function play(){

	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	
	//teste da criação de expressões.
	for (var i=0; i<50; i++) {

		//na criação de uma nova expressão o valor de coeficiente e
		//fitness já é calculado.

		var exp = new Expression(expressionSize);
		console.log(exp.getStringExpression_d());
		ctx.font="20px Arial";
		ctx.fillText(exp.getStringExpression_d(), 50, 50 + 35*i);
		ctx.stroke();
	}
}
