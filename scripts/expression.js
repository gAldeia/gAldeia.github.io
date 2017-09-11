//Expression.js


//VARIAVEIS GLOBAIS-------------------------------------------------------------
var inputPoints = [ ];
//armazena os pontos de entrada. é global pois é de interesse de muitos métodos
//da regressão simbólica, assim como métodos futuros para plotar os pontos no
//gráfico.

var expressionSize = 2;
//representa o número de funções menores que a expressão terá.

var populationSize = 15;
//tamanho da população

var exponentRange = 3;
//o intervalo que as potências das variáveis poderão assumir. isso é controlado
//para evitar números absurdos. 

var mutationRate = 5;
//chance de ocorrer mutação, em % (0 a 100).

//variáveis do canvas da página
var canvas;
var ctx;


//CLASSES DA REGRESSÃO----------------------------------------------------------
var DataPoint = function(x, y){

	//dataPoint é a estrutura que armazena cada ponto de entrada 
	//(x0, x1, ..., xn) e seu respectivo valor alvo y. É importante
	//que o x passado seja um array: new DataPoint([0, 1, 2, 3], 4).

	this.x = x;
	this.y = y;
	//this.size = x.size; //não sei se é necessário
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

	//inicializando algumas coisas (o mse é calculado no construtor,
	//para evitar que existam subjects com mse = 0)
	this.coefficients = [ ];
	this.equation = [ ];
	this.mse = 0.0;
	this.equationSize = size;

	for (var i=0; i<this.equationSize; i++){
		this.equation.push(new SimpleFunction());
		this.coefficients.push(1.0);
	}

	this.adjustCoefficients();
	this.mse = this.evaluateExpression();
}

var Population = function(size, expressionSize){

	//classe para gerenciar um array de expressões, denominado população.
	//aqui invoco os eventos seleção, crossover e mutação.

	this.subjects = [ ];
	this.subjectsSize = size;

	for(var i=0; i<size; i++){
		this.subjects.push(new Expression(expressionSize) );
	}

}

//IMPLEMENTAÇÃO DE MÉTODOS DA CLASSE SIMPLEFUNCTION-----------------------------
SimpleFunction.prototype.getStringExpression_d = function() {

	//método que retorna uma string contendo a função menor.

	var expression = this.operation + "(";
	for (var i=0; i<this.variablesSize; i++){
		expression +=  "x" + i + "^" + this.exponents[i] + (i<this.exponents.length-1? " * " : "");
	}
	return (expression + ")");
}

SimpleFunction.prototype.evaluateSimpleFunction = function(x){

	//realizo o cálculo da equação menor. O valor é calculado pegando
	//todos os valores de x passados por parâmetro e elevando às suas
	//respectivas potências e os multiplicando entre sí. Após isso,
	//retorna a operação da função menor usando como parâmetro o
	//valor calculado.

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
			return Math.abs(value);
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


//IMPLEMENTAÇÃO DE MÉTODOS DA CLASSE EXPRESSION---------------------------------
Expression.prototype.getStringExpression_d = function(){

	//método que retorna uma string equivalente à expressão completa,
	//incluindo os coeficientes multiplicando suas respectivas funções
	//menores.

	var expression = "";
	for (var i=0; i<this.equationSize; i++){
		expression += this.coefficients[i].toFixed(3) + "*" + this.equation[i].getStringExpression_d() + (i<this.equationSize-1? " + " : "");
	}
	return expression;
}

Expression.prototype.adjustCoefficients = function(){

	//aqui uso uma regressão linear para ajustar os coeficientes dos
	//pequenos termos.
	


	/*

	IMPLEMENTAÇÃO (ANTIGA) DO MÉTODO ORDINARY LEAST SQUARES

	//guarda o valor temporário dos novos coeficientes calculados.
	var aux = [ ];

	//guardam valores para evitar processos repetidos.
	var X = xvaluesToMatrix();
	var Y = yvaluesToArray();
	var Xtransp = math.transpose(X);

	//no final dos calculos a seguir, espera-se que o valor seja:
	//aux = ((X'X)^-1)X'Y

	aux =  math.multiply(X, Xtransp);

	//transforma a matrix aux em aux^-1
	aux = math.inv(aux);

	aux = math.multiply(Xtransp, aux);
	aux = math.multiply(aux, Y);

	this.coefficients = aux;

	*/
}

Expression.prototype.evaluateExpression = function(){

	//Avaliação da equação a partir do cálculo do MSE.

	this.mse = 0.0;

	for (var i=0; i<inputPoints.length; i++){
		var expressionValue = 0.0;

		for(var j=0; j<this.equationSize; j++){
			//multiplico cada um dos coeficientes pela resolução da eq.
			expressionValue += this.coefficients[j]*this.equation[j].evaluateSimpleFunction(inputPoints[i].x);
		}

		this.mse += Math.pow(inputPoints[i].y - expressionValue, 2);
	}

	//calculo e atualizo o valor do mse

	console.log("Calculando mse");
	this.mse = Math.sqrt(this.mse/inputPoints.length);
	console.log(this.mse);

	if (this.mse == 0.0)
		console.log("EITA GIOVANA");

	return this.mse;
}


//IMPLEMENTAÇÃO DOS MÉTODOS DA CLASSE POPULAION---------------------------------
Population.prototype.getStringBestIndividual_d = function(){

	//busca pela população o melhor mse e devolve uma string equivalente
	//à sua equação.

	var theBest = this.subjects[0];
	
	for(var i=1; i<this.subjectsSize; i++){

		console.log("check");

		if (this.subjects[i].mse < theBest.mse)
			theBest = this.subjects[i];
	}

	console.log("MSE DO MELHOR:");
	console.log(theBest.mse.toFixed(3));

	return theBest.getStringExpression_d();
}

Population.prototype.mutate = function(rate){

	//percorro toda a população, sorteando se ocorrerá mutação ou não.

	for (var i=0; i<this.subjectsSize; i++){
		//percorre cada individuo

		for (var j=0; j<this.subjects[i].equationSize; j++){
			//percorre cada equação menor

			if (getRandomInt(0, 100) <= rate){
				this.subjects[i].equation[j] = new SimpleFunction();
			}
		}
	}
}

Population.prototype.evaluateExpressions = function(){
	
	//atualiza todos os mse da população

	for(var i=0; i<this.subjectsSize; i++){
		this.subjects[i].evaluateExpression();
	}

}

//FUNÇÕES ÚTEIS-----------------------------------------------------------------
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

function xvaluesToMatrix(){

	//transforma os pontos X da entrada numa matrix, para que possa ser
	//utilizado na regressão linear.

	var matrix = [];

	for(var i=0; i<inputPoints.length; i++)
		matrix.push(inputPoints[i].x);

	return matrix;
}

function yvaluesToArray(){

	//transforma os pontos Y da entrada num vetor, para que possa ser
	//utilizado na regressão linear

	var array = [ ];

	for(var i=0; i<inputPoints.length; i++)
		array.push(inputPoints[i].y);

	return array;
}

//FUNÇÕES DA PÁGINA-------------------------------------------------------------
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

	//limpa o canvas
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	
	//cria uma nova população
	var myPop = new Population(populationSize, expressionSize);
	
	//imprime informação no canvas
	ctx.font="20px Arial";	
	ctx.fillText(myPop.getStringBestIndividual_d(), 50, 50);

	//aplica mutação na população
	myPop.mutate(5);

	//atualiza o mse
	myPop.evaluateExpressions();

	//imprime o melhor mse. espera-se aqui que alguma coisa mude (ou
	//não, já que não está ocorrendo seleção)
	ctx.fillText(myPop.getStringBestIndividual_d(), 50, 150);

	/*

	ANTIGO TESTE DE CRIAÇÃO DE EXPRESSÕES, PŔE-POPULATION

	//teste da criação de expressões.
	for (var i=0; i<10; i++) {

		//na criação de uma nova expressão o valor de coeficiente e
		//fitness já é calculado.

		var exp = new Expression(expressionSize);
		console.log(exp.getStringExpression_d());
		ctx.font="20px Arial";
		ctx.fillText(exp.getStringExpression_d(), 50, 50 + 35*i);
		ctx.stroke();
	}
	
	*/
}
