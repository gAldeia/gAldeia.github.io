//loadFile.js


//VARIÁVEIS GLOBAIS-------------------------------------------------------------
var lines = [];
//variável que armazena os valores numa matriz. A entrada deve ser feita
//no seguinte esquema:
//[ [y, [x1, x2, x3, ...]], [y, [x1, x2, x3, ...]], ... ] 
//e os valores serão salvos (sem separar os x-zes em uma nova dimensão:
//[ [y, x1, x2, ...], [y, x1, x2, ...] ]

//conjunto dos pontos de entrada
var inputPoints = [ ];

var labels = [ ];

var firstLineAsLabel = 0;


// --CLASSES DO ALGORITMO GENÉTICO------------------------------------------- //
var DataPoint = function(x, y){
	
		//ponto de entrada. Objeto para representar melhor os pontos 
		//digitados na entrada do programa
	
		this.x = x;
		this.y = y;
}

function linesToDataPoint(){
	
	//Converte os pontos lidos para DataPoint. DataPoint é uma classe
	//da expressão genética. é apenas um rearranjo de points, porem
	//com uma notação mais "intuitiva"

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
function csv_upload(){

	//função que é chamada para ler um arquivo enviado localmente. O arquivo
	//deve ser do tipo .csv, e os dados separados por vírgulas. o resultado
	//será carregar lines com os valores lidos.

	var reader = new FileReader();
	var csv = document.getElementById("my-csvinput").files[0];

	if (csv==undefined){
		document.getElementById("notification").innerHTML="<div class='alert alert-danger'><p class='text-justify'><strong>Atenção!</strong> O algoritmo precisa de pelo menos uma linha de entrada para funcionar. O site só aceita arquivos de extensão .csv.</p></div>";

		return;
	}
	
	reader.readAsText(csv);
	reader.onload = function(event) {
		var data = event.target.result;
		return loadHandler(data);
	}
}

function manual_upload(){

	//função que lê os dados digitados pelo usuário. funciona da mesma forma
	//que a anterior, porém retira os valores de um lugar diferente.

	var textArea = document.getElementById("my-manualinput").value;

	return loadHandler(textArea);
}

function loadHandler(inputData){
	
	//é aqui que a magia acontece. Função separa cada linha da entrada,
	//e em cada linha separa cada valor. O resultado é armazenado em 
	//lines, pronto para ser utilizado por funções matemáticas.

	lines = [ ];

	var allTextLines = inputData.split(/\r\n|\n/);
	
	if (document.getElementById("labeled").checked){
		
		let aux = allTextLines[0].split(/\ |,|\t/);
		for(let i=0; i<aux.length; i++){
			if (aux[i].length>0)
				labels.push(aux[i]);
		}

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
			if (lines[0].length != tarr.length){

				document.getElementById("notification").innerHTML="<div class='alert alert-danger'><p class='text-justify'><strong>Atenção!</strong> Nem todas as suas linhas de entrada contém a mesma quantidade de números!</p></div>";

				return;
			}
		}
	}

	//avisos ao usuário
	if (lines.length==0){
		document.getElementById("notification").innerHTML="<div class='alert alert-danger'><p class='text-justify'><strong>Atenção!</strong> O algoritmo precisa de pelo menos uma linha de entrada para funcionar. O site só aceita arquivos de extensão .csv.</p></div>";
	}
	else if (lines[0].length==1){
		document.getElementById("notification").innerHTML="<div class='alert alert-danger'><p class='text-justify'><strong>Atenção!</strong> cada linha precisa de pelo menos 2 valores!</p></div>";
	}
	else {
		document.getElementById("notification").innerHTML="<div class='alert alert-success'><strong>Sucesso!</strong> Os dados foram carregados.</div>";

		inputPoints = linesToDataPoint();
	}
}