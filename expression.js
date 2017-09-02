//expression.js


//VARIAVEIS GLOBAIS-------------------------------------------------------------
var inputPoints = [ ];
//armazena os pontos de entrada. é global pois é de interesse de muitos métodos
//da regressão simbólica, assim como métodos futuros para plotar os pontos no
//gráfico.

var expressionSize = 3;
//representa o número de termos que a expressão terá.

var exponentRange = 3;
//o intervalo que as potências das variáveis poderão assumir. isso é controlado
//para evitar números absurdos. 


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

var Expression = function(){

	//classe que representa a função final, onde é feita a composição
	//com as funções menores. Aqui as variáveis globais têm efeito na
	//criação da expressão. A composição é feita multiplicando cada um
	//dos termos por uma constante w, que tem seu valor ajustado duran-
	//te a execução por um algoritmo de regressão linear; e por fim 
	//somando o resultado de cada uma das funções menores (g(), h(), ...):
	//f(x, y, ...) = w0*g(x, y, ...) + w1*f(x, y, ...) + ...

	this.equation = [ ];
	this.expressionSize = expressionSize;

	for (var i=0; i<expressionSize; i++) 
		this.equation.push(new SimpleFunction());
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

Expression.prototype.getStringExpression_d = function(){

	//método que retorna uma string equivalente à expressão completa,
	//incluindo os coeficientes multiplicando suas respectivas funções
	//menores.

	var expression = "";
	for (var i=0; i<this.expressionSize; i++){
		expression += "w" + i + "*" + this.equation[i].getStringExpression_d() + (i<this.expressionSize-1? " + " : "");
	}
	return expression;
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

	switch(getRandomInt(0, 8)){
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
		case 8: //soma dos termos
			return "sum";
		default:
			alert("PROBLEMA EM GETRANDOMOPERATION");
	}
}

function setup(){

}

function play(){

	//"leitura" dos dados de entrada. (futuramente, esses dados serão
	//digitados pelo usuário ou lidos de um arquivo .csv)
	inputPoints.push(new DataPoint([1, 0, 5], 2));
	inputPoints.push(new DataPoint([2, 2, 5], 5));

	//teste da criação de expressões.
	for (var i=0; i<10; i++) {
		var exp1 = new Expression();
		console.log(exp1.getStringExpression_d());
	}
	
}
