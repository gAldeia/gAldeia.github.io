//loadFile.js


//script simples para leitura de dados do usuário e armazenamento.
//também oferece uma nova classe, feita para organizar melhor os dados lidos.


// --VARIÁVEIS GLOBAIS------------------------------------------------------- //
var lines = [];
//variável que armazena os valores de leitura numa matriz. Todas as linhas devem
//seguir a ordem:
//	x1, x2, x3, ..., xn, y

//conjunto dos pontos de entrada
var inputPoints = [ ];

//rótulos, caso sejam passados
var labels = [ ];

//variável de controle de utilização de rótulo
var firstLineAsLabel;


// --CLASSES DE ARMAZENAMENTO DE DADOS--------------------------------------- //
var DataPoint = function(x, y){
	//ponto de entrada. Objeto para representar melhor os pontos 
	//digitados na entrada do programa

	this.x = x;
	this.y = y;
}

function linesToDataPoint(){
	//Converte os pontos lidos para DataPoint (apenas um rearranjo de points,
	//porem com uma notação mais "intuitiva"

	var Points = [];
	var aux;

	for (var i=0; i<lines.length; i++){
		aux = [];

		for(var j=0; j<lines[i].length-1; j++)
			aux.push(lines[i][j]);
		Points.push(new DataPoint(aux, lines[i][lines[i].length-1]) );
	}
	return Points;
}


//MÉTODOS DE LEITURA------------------------------------------------------------
function csv_upload(element){

	//função que é chamada para ler um arquivo enviado localmente. O arquivo
	//deve ser do tipo .csv, e os dados separados por vírgulas. o resultado
	//será carregar lines com os valores lidos.

	var reader = new FileReader();
	var csv = document.getElementById(element).files[0];

	if (csv==undefined){
		throw "undefined csv";
	}
	
	reader.readAsText(csv);
	reader.onload = function(event) {
		var data = event.target.result;
		return loadHandler(data);
	}
}

function manual_upload(element){

	//função que lê os dados digitados pelo usuário. funciona da mesma forma
	//que a anterior, porém retira os valores de um lugar diferente.

	var textArea = document.getElementById(element).value;

	return loadHandler(textArea);
}

function loadHandler(inputData){
	
	//é aqui que a magia acontece. Função separa cada linha da entrada,
	//e em cada linha separa cada valor. O resultado é armazenado em 
	//lines, pronto para ser utilizado por funções matemáticas.

	lines = [ ];
	labels = [ ];
	firstLineAsLabel = 0;

	var allTextLines = inputData.split(/\r\n|\n/);
	
	if (document.getElementById("labeled").checked){
		
		let aux = allTextLines[0].split(/\ |,|\t/);
		for(let i=0; i<aux.length; i++)
			if (aux[i].length>0)
				labels.push(aux[i]);

		firstLineAsLabel = 1;
	}
	else{
		firstLineAsLabel = 0;
		labels = [ ];
	}

	for (var i=0+firstLineAsLabel; i<allTextLines.length; i++){
	
		var data = allTextLines[i].split(/\ |,|\t/);
		var tarr = [];

		for (var j=0; j<data.length; j++){

			//controle para ver se é um número (jamais duvide da capacidade
			//do usuário). Isso previne entradas que não sejam números de
			//serem processados como se fossem um.

			var aux = parseFloat(data[j]);
			if (!isNaN(aux))
				tarr.push(aux);
		}
		if (tarr.length>0) {
			lines.push(tarr);
			if (lines[0].length != tarr.length)
				throw "corrupted lines";
		}
	}

	//erros de entrada incoerente
	if (lines.length==0) 
		throw "no data";

	else if (lines[0].length==1)
		throw "only 1 value";

	else
		inputPoints = linesToDataPoint();
}