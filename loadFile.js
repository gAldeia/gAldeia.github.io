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
			tarr.push( parseFloat(data[j]) );
		}
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
			tarr.push( parseFloat(data[j]) );
		}
		lines.push(tarr);
	}
	console.log(lines);	
}
