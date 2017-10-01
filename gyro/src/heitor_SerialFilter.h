#pragma once

#if defined(ARDUINO) && ARDUINO >= 100
#include <Arduino.h>
#else
#include "WProgram.h"
#endif

template <typename type> class RoundArray
{
	const size_t Len;
	type* Vals = new type[Len];
	size_t pointer = 0;
public:
	RoundArray(const unsigned int &len) :Len(len)
	{
		for (unsigned int i = 0; i < Len; i++) Vals[i] = 0;
	}
	~RoundArray() // Destructor
	{
		delete[] Vals;
	}
	void push(const type &var)
	{
		Vals[pointer] = var;
		pointer = pointer + 1 == Len ? 0 : pointer + 1;
	}
	operator float()
	{
		return Vals[pointer];
	}
	type &operator[](int index)
	{
		return Vals[(Len + pointer - index - 1) % Len];
	}
	void operator=(const type &var)
	{
		push(var);
	}
	size_t length()
	{
		return Len;
	}
};

class MovingAverage
{
	const unsigned int N;
	RoundArray<float> Vals;
	float media = 0, max = 0, min, sigma;
public:
	MovingAverage(int n);
	float addValor(const float &valor);
	float getMedia();
	float getVar();
	float getMax();
	float getMin();
	float operator=(const float &valor);
	operator float();
};

/*
class MediaMovel
{
	const unsigned int N;
	float* Vals = new float[N];
	float media, max = 0, min, sigma;
public:
	MediaMovel(int n);	//Inicializadore
	~MediaMovel();
	float addValor(const float &valor);
	float getMedia();
	float getVar();
	float getMax();
	float getMin();
	operator float();
};*/

class SerialFilter
{
	const int N;
	MovingAverage **MM = new MovingAverage*[N];
public:
	SerialFilter(int n, int v);
	SerialFilter(int n, int V[]);
	float operator=(const float &in);
	operator float();
};
