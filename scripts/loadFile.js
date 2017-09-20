//loadFile.js


//VARIÁVEIS GLOBAIS-------------------------------------------------------------
var lines = [];
//variável que armazena os valores numa matriz. A entrada deve ser feita
//no seguinte esquema:
//[ [y, [x1, x2, x3, ...]], [y, [x1, x2, x3, ...]], ... ] 
//e os valores serão salvos (sem separar os x-zes em uma nova dimensão:
//[ [y, x1, x2, ...], [y, x1, x2, ...] ]


//MÉTODOS DE LEITURA------------------------------------------------------------
function csv_upload(){

	//função que é chamada para ler um arquivo enviado localmente. O arquivo
	//deve ser do tipo .csv, e os dados separados por vírgulas. o resultado
	//será carregar lines com os valores lidos.

	var reader = new FileReader();
	var csv = document.getElementById("my-csvinput").files[0];

	reader.readAsText(csv);
	reader.onload = function(event) {
		var data = event.target.result;
		loadHandler(data);
	}

	//aviso ao usuário de que o arquivo foi carregado.
	window.alert("Arquivo carregado.");
}

function manual_upload(){

	//função que lê os dados digitados pelo usuário. funciona da mesma forma
	//que a anterior, porém retira os valores de um lugar diferente.

	var textArea = document.getElementById("my-manualinput").value;

	loadHandler(textArea);

	//aviso ao usuário de que o arquivo foi carregado.
	window.alert("Leitura efetuada.");
}

function loadHandler(inputData){
	
	//é aqui que a magia acontece. Função separa cada linha da entrada,
	//e em cada linha separa cada valor. O resultado é armazenado em 
	//lines, pronto para ser utilizado por funções matemáticas.

	lines = [ ];

	var allTextLines = inputData.split(/\r\n|\n/);
	
	for (var i=0; i<allTextLines.length;i++){
	
		var data = allTextLines[i].split(',');
		var tarr = [];
		
		for (var j=0; j<data.length; j++){

			//controle para ver se é um número (jamais duvide da capacidade
			//do usuário). Isso previne entradas que não sejam números de
			//serem processados como se fossem um.

			var aux = parseFloat(data[j]);
			if (!isNaN(aux))
				tarr.push(aux);
		}
		if (tarr.length>0)
			lines.push(tarr);
	}
}

function linesToDataPoint(){

	//Converte os pontos lidos para DataPoint. DataPoint é uma classe
	//da expressão genética. é apenas um rearranjo de points, porem
	//com uma notação mais "intuitiva"

	var Points = [];
	var aux;

	for (var i=0; i<lines.length; i++){
		aux = [];

		for(var j=1; j<lines[i].length; j++)
			aux.push(lines[i][j]);
		
		Points.push(new DataPoint(aux, lines[i][0]) );
	}
	alert(Points[1]===Points[2]);
	return Points;
}
