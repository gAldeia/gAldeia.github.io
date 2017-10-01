

#include "heitor_SerialFilter.h"


MovingAverage::MovingAverage(int n) : N(n), Vals(n)
{
}
float MovingAverage::addValor(const float & valor)
{
	media *= N;
	media -= Vals;
	media += valor;
	media /= N;
	Vals = valor;
	max = (media > max) ? media : max;
	min = (media < min) ? media : min;
	return media;
}
float MovingAverage::getMedia()
{
	return media;
}
float MovingAverage::getVar()
{
	sigma = 0;
	for (unsigned int i = 0; i < N; i++) sigma += pow(Vals[i] - media, 2.f);
	sigma = pow(sigma / (N - 1), .5f);
	return sigma;
}
float MovingAverage::getMax()
{
	return max;
}
float MovingAverage::getMin()
{
	return min;
}
float MovingAverage::operator=(const float & valor)
{
	return addValor(valor);
}
MovingAverage::operator float()
{
	return media;
}


SerialFilter::SerialFilter(int n, int v) : N(n)
{
	for (int i = 0; i < N; i++) MM[i] = new MovingAverage(v);
}
SerialFilter::SerialFilter(int n, int V[]) : N(n)
{
	for (int i = 0; i < N; i++) MM[i] = new MovingAverage(V[i]);
}
float SerialFilter::operator=(const float &in)
{
	(*MM[N - 1]) = in;
	for (int i = N - 1; i > 0; i--) (*MM[i - 1]) = ((*MM[i]).getMedia());
	return (*MM[0]).getMedia();
}
SerialFilter::operator float()
{
	return (*MM[0]);
}
