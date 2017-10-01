//Importando as classes utilizadas ---------------------------------------------
#include <Wire.h>
#include <Arduino.h>
#include "heitor_SerialFilter.h"


//Definindo as portas utlizadas para comunicação com o MPU6050 -----------------
#define MPU6050_BEGINNING 0x3B
#define MPU6050_I2C_ADDRESS 0x68


//definição das variáveis globais que armazenam as medidas do sensor -----------
float Temp;
float aux1, aux2; //variaveis auxiliares globais (uso geral)
int start = 0, last = 0; //variaveis para controle do tempo

//Criação dos filtros seriais para usar com o giro -----------------------------
SerialFilter serial1(10, 5);
SerialFilter serial2(10, 5);
SerialFilter serial3(10, 5);


//Criação da classe de um ponto 3d ---------------------------------------------
class point3d{
	public:
		float x;
		float y;
		float z;

		point3d(float x = 0, float y = 0, float z = 0);
	
		void rotateonX(float theta);
		void rotateonY(float theta);
		void rotateonZ(float theta);
};

point3d::point3d(float x = 0, float y = 0, float z = 0){
	this->x = x;
	this->y = y;
	this->z = z;
}

void point3d::rotateonX(float tetha){

	float cos_tetha = cos(tetha);
	float sin_tetha = sin(tetha);

	float aux1 = y;
	float aux2 = z;

	y = (cos_tetha*aux1) - (sin_tetha*aux2);
	z = (cos_tetha*aux2) + (sin_tetha*aux1); 
}

void point3d::rotateonY(float tetha){

	float cos_tetha = cos(tetha);
	float sin_tetha = sin(tetha);

	float aux1 = x;
	float aux2 = y;

	x = (cos_tetha*aux1) - (sin_tetha*aux2);
	z = (cos_tetha*aux2) + (sin_tetha*aux1); 
}

void point3d::rotateonZ(float tetha){

	float cos_tetha = cos(tetha);
	float sin_tetha = sin(tetha);

	float aux1 = x;
	float aux2 = y;

	x = (cos_tetha*aux1) - (sin_tetha*aux2);
	y = (cos_tetha*aux2) + (sin_tetha*aux1); 
}

//declaração dos pontos utilizados no programa
point3d Acc_offset;
point3d Gyro;
point3d Acc;


//FUNÇÕES RELACIONADAS COM O SENSOR: SETUP, READ E SET_OFFSET ------------------
void setup_MPU6050(){

	//Activate the MPU-6050
	Wire.beginTransmission(0x68);       
	Wire.write(0x6B);                                                   
	Wire.write(0x00);                                                 
	Wire.endTransmission();   

	//Configure the accelerometer (+/-8g)
	Wire.beginTransmission(0x68);
	Wire.write(0x1C);               
	Wire.write(0x10);
	Wire.endTransmission();

	//Configure the gyro (500dps full scale)
	Wire.beginTransmission(0x68);                                        
	Wire.write(0x1B);                                                    
	Wire.write(0x08);                                                    
	Wire.endTransmission();                                             
}

float read_MPU6050 () {

	Wire.beginTransmission(MPU6050_I2C_ADDRESS);
	Wire.write(MPU6050_BEGINNING);
	Wire.endTransmission();
	Wire.requestFrom(MPU6050_I2C_ADDRESS, 14);

	Acc.x = ( ( (Wire.read() << 8 | Wire.read()) / 4096.0 ) * 9.81);
	Acc.y = ( ( (Wire.read() << 8 | Wire.read()) / 4096.0 ) * 9.81);
	Acc.z = ( ( (Wire.read() << 8 | Wire.read()) / 4096.0 ) * 9.81);

	Temp = ((Wire.read() << 8 | Wire.read()) / 340.0 ) + 36.53;

	Gyro.x = (Wire.read() << 8 | Wire.read()) * 7.6335;
	Gyro.y = (Wire.read() << 8 | Wire.read()) * 7.6335;
	Gyro.z = (Wire.read() << 8 | Wire.read()) * 7.6335;

}


void set_off_set() {

	//as medidas do offset serão usadas para criar o vetor global relativo à
	//gravidade do foguete. Sempre que o foguete se movimentar, o offset deve
	//ser rotacionado inversamente ao movimento, para que permaneça sempre para
	//baixo.

	for (int i=0; i<100; i++){

		Serial.print(".");

		read_MPU6050();

		Acc_offset.x +=Acc.x;
		Acc_offset.y +=Acc.y;
		Acc_offset.z +=Acc.z;

		serial1 = Gyro.x;
		serial2 = Gyro.y;
		serial3 = Gyro.z;

		delay(25);
	}
	Serial.println("");

	Acc_offset.x /= 100.0;
	Acc_offset.y /= 100.0;
	Acc_offset.z /= 100.0;
}

void adjust_off_set(){

	Acc_offset.rotateonX((Gyro.x*PI)/180.0);
	Acc_offset.rotateonY((Gyro.y*PI)/180.0);
	Acc_offset.rotateonZ((Gyro.z*PI)/180.0);
}


//FUNÇÕES DE CALCULO DE INFORMAÇÕES DE VOO -------------------------------------
//variável global para fazer a integral da aceleração
//com essa função, podemos calcular a distancia máxima percorrida, 
//a velocidade máxima atingida, entre outros.

//variavel start é global para poupar declarações e garantir que tudo funcione 
//com os mesmos dados
float IntegrateRiemann(float Acc){
	float deltaTime = last - start;
	//a velocidade é a integral da aceleração
	//a integral aqui está sendo feita pelo soma de Riemann
	float rect = deltaTime * Acc;
	return rect;
}

//integra a aceleração instantanea para ver a velocidade
float highestMomentaniumSpeed = 0;
float get_highestSpeed(float Acc){
	//a função tbm retorna a velocidade medida no momento. isso pode acarretar
	//num maior custo computacional, mas facilita o uso da informação por outras
	//funções
	float speed = IntegrateRiemann(Acc);
	if (speed>highestMomentaniumSpeed){
		highestMomentaniumSpeed = speed;
	}
	return speed;
}

//integra a velocidade instantanea para ver
float MaxDistance = 0;
float Update_highestSpeed(float Acc){
	//a distancia é uma integral dupla da aceleração
	float distance = IntegrateRiemann(get_highestSpeed(Acc));
	if (distance>MaxDistance){
		MaxDistance = distance;
	}
	return distance;
}


//PROGRAMA PRINCIPAL -----------------------------------------------------------
void setup(){

	Wire.begin();

	Serial.begin(115200); //inicia o serial

	Wire.write(0); //tira o sensor do sleep-mode

	setup_MPU6050();
	set_off_set();

	Serial.print(Acc_offset.x);
	Serial.print("\t");
	Serial.print(Acc_offset.y);
	Serial.print("\t");
	Serial.println(Acc_offset.z);
}

void loop(){

	//como o tempo é muito utilizado pois ocorrem várias integrações, é bom
	//que essa variável seja global, assim como a last. isso garante que todos
	//os processos, em cada execução do loop, utilizem o mesmo dt para as integrais.
	start = millis();

	//A cada nova leitura é necessário ajustar o novo offset
	read_MPU6050();
	adjust_off_set();

	//para que o calculo seja o mais próximo possível do ideal, acredito que a melhor
	//alternativa seja evitar filtrar a aceleração, pois os dados estão sendo integrados com o ruido,
	//mas essa situação ainda é melhor do que a suavização que um filtro geraria para cada uma de todas
	//as medidas.
	//aqui, acho que o ruido, que é pequeno, é melhor do que a suavização da curva gerada por um filtro,
	//POR OUTRO LADO, o giroscópio é muito utilizado para ajustar o vetor da aceleração de gravidade e 
	//filtrar esse valor do acelerometro, então este tem que funcionar com precisão. Talvez a implementação
	//de um filtro de passa alta com poucos valores seja bom, pois suaviza um pouco a medição mas ainda garante
	//um dado com menos ruidos.
	//DE QUALQUER FORMA, os sensores utilizados não são de alto nível de distorção de medidas. É necessário
	//fazer um estudo para avaliar qual opção é a melhor, ou se nenhuma é boa o suficiente e o 
	//problema precisaria de uma abordagem diferente para esta solução.
	Acc.x -= Acc_offset.x;
	Acc.y -= Acc_offset.y;
	Acc.z -= Acc_offset.z;

	Serial.print(Acc.x);
	Serial.print("\t");
	Serial.print(Acc.y);
	Serial.print("\t");
	Serial.println(Acc.z);

	//necessário deixar isso aqui, para atualizar o valor de start.
	last = start;
}
