import numpy as np

F = np.arange(10, 200, 10)  # forca costuma variar de 0 a 1000 em multiplos de 10
ds   = np.arange(10, 150, 5) # distancia pode ser de 10 a 100 metros
V = np.arange(10, 250, 10)
cosT = np.random.uniform(-1, 1, (100,)) # cosseno sao valores de -1 a 1

for i in range(len(cosT)):
    cosT[i] = round(cosT[i], 2)

# gera uma permutacao aleatoria dos elementos gerados
p1 = np.random.permutation(F)
p2 = np.random.permutation(ds)
p3 = np.random.permutation(cosT)
p4 = np.random.permutation(V)

c = float(299792458)
R = 8.314598
# menor tamanho entre os vetores
l = min(len(p1), len(p2), len(p4))

# calcula W
W  =  2*3.14159*(p1[:l]/9.807)**(1.0/2)
print "tabela:"
# imprime
for i in range(l):
    print p1[i], p2[i], W[i]


    
print "\nSITE:"
# imprime
for i in range(l):
    print "<tr><td>" +  str(p1[i]) + "</td><td>"  + str(round(W[i], 2)) +  "</td></tr>"