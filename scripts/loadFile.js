//loadFile.js


//variável que armazena os valores numa matriz, sem realizar conversão
//para dataPoint.
var lines = [];


function csv_upload(){
	/* Função chamada ao fazer upload de um arquivo .csv. é responsável pela
	 * leitura e transformação do arquivo num array multidimensional, contendo
	 * os valores para plotar o gráfico.
	 */

	var reader = new FileReader();
	var csv = document.getElementById("my-csvinput").files[0];
	
	//nova referência para o array, para incorpovar apenas os valores
	//novos
	lines = [];

	reader.readAsText(csv);
	reader.onload = loadHandler;

	window.alert("Arquivo carregado.");
}

function loadHandler(event){
	/* Função destinada a dividir o arquivo .csv em vários arrays para serem
		* utilizados pelas funções de plot. Ela separa a entrada .csv no seguin-
		* te formato: array[ array[], array[], array[] ...], onde cara array 
		* menor é um conjunto de coordenadas (2 ou 3 eixos).
		*/
	
	var csv = event.target.result;
	var allTextLines = csv.split(/\r\n|\n/);
	
	for (var i=0; i<allTextLines.length;i++){
	
		var data = allTextLines[i].split(',');
		var tarr = [];
		
		for (var j=0; j<data.length; j++){

			//controle para ver se é um número, pois o usuário pode digitar
			//coisas sem sentido acidentalmente.

			var aux = parseFloat(data[j]);
			if (!isNaN(aux))
				tarr.push(aux);
		}

		console.log(tarr);
		if (tarr.length>0)
			lines.push(tarr);
	}
	console.log(lines);
}


function manual_upload(){

	/*é preciso fazer a validação dos dados!!!!*/

	//nova referência pra lines
	lines = [];

	var textArea = document.getElementById("my-manualinput").value;
	var allTextLines = textArea.split(/\r\n|\n/);
	
	for (var i=0; i<allTextLines.length;i++){
	
		var data = allTextLines[i].split(',');
		var tarr = [];

		for (var j=0; j<data.length; j++){

			//controle para ver se é um número, pois o usuário pode digitar
			//coisas sem sentido acidentalmente.

			var aux = parseFloat(data[j]);
			if (!isNaN(aux))
				tarr.push(aux);
		}

		console.log(tarr);
		if (tarr.length>0)
			lines.push(tarr);
	}
	console.log(lines);

	window.alert("leitura efetuada");
}

function linesToDataPoint(){

	//Converte os pontos lidos para DataPoint.

	var Points = [];

	var y;
	var aux;

	for (var i=0; i<lines.length; i++){

		y = lines[i][0];
		aux = [];

		for(var j=1; j<lines[i].length; j++){
			aux.push(lines[i][j]);
		}
		
		Points.push(new DataPoint(aux, y) );
	}
	return Points;
}
