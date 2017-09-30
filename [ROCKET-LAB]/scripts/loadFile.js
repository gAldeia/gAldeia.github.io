//loadFile.js


//VARIÁVEIS GLOBAIS-------------------------------------------------------------
var lines = [];
//variável que armazena os valores numa matriz. A entrada deve ser feita
//no seguinte esquema:
//[ [y, [x1, x2, x3, ...]], [y, [x1, x2, x3, ...]], ... ] 
//e os valores serão salvos (sem separar os x-zes em uma nova dimensão:
//[ [y, x1, x2, ...], [y, x1, x2, ...] ]

var scale = 0.0174533;
//var scale = 0.166666666666667;
//escala para ajustar os dados de acordo com o gyro 6050.
//a sensibilidade do gyro mpu 6050 é de 250 graus por seg. a conversão
//para radianos é feita multiplicando por 0,0174533.

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
}

function manual_upload(text){

	//função que lê os dados digitados pelo usuário. funciona da mesma forma
	//que a anterior, porém retira os valores de um lugar diferente.

	//var textArea = document.getElementById("my-manualinput").value;
	var textArea = text.value;

	loadHandler(textArea);
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
				tarr.push(aux*scale);
		}
		if (tarr.length>0)
			lines.push(tarr);
	}
}