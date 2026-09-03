import math
def frus(r1,h=1.50,dh=1.50):
    r2=r1+dh
    return math.pi*h/3*(r1*r1+r1*r2+r2*r2)

linhas=[
 ('816','TQ-6310816A a D','OB 100N',4,13.71,29.00,4100.16,3945.84,2434.25),
 ('817','TQ-6310817A a D','OB 220N',4,13.71,29.00,4130.06,3947.50,2464.06),
 ('818','TQ-6310818A a D','OB 500/600N',4,12.78,27.50,3599.36,3455.05,2071.27),
 ('815','TQ-6310815A a D','OB 80N',4,10.85,24.00,2649.19,2492.22,1415.86),
 ('824','TQ-6312824','UCO',1,18.53,None,2789.14,1756.44,2235.88),
]
tc=tr=tv=tx=0
hdr = "%-5s %6s %6s %9s %10s %10s %8s %7s %10s %9s %6s" % ('L','R1','R2','Vunit','Vcalc','Reat.des','delta','%','Corte','Compl','%tq')
print(hdr)
for n,tag,prod,q,r1,esp,corte,reat,X in linhas:
    v=frus(r1); vt=v*q; d=vt-reat; compl=corte-reat
    tc+=corte; tr+=reat; tv+=vt; tx+=X
    print("%-5s %6.2f %6.2f %9.2f %10.2f %10.2f %8.2f %6.2f%% %10.2f %9.2f %5.1f%%" % (n,r1,r1+1.5,v,vt,reat,d,d/reat*100,corte,compl,reat/corte*100))
print('-'*100)
print("TOTAIS: Vcalc=%.2f  Reaterro_des=%.2f  delta=%.2f (%.2f%%)  Corte=%.2f  Compl=%.2f" % (tv,tr,tv-tr,(tv-tr)/tr*100,tc,tc-tr))
print()
print('=== PLANILHA DE IMPORTACAO (situacao atual) ===')
tot=0
for n,tag,prod,q,r1,esp,corte,reat,X in linhas:
    ft=(X/2)*0.7*1.4; tot+=ft*2
    print("%s: base=%9.2f  por FT=%9.2f  x2 FTs=%9.2f | corte desenho=%9.2f  razao=%.3f" % (n,X,ft,ft*2,corte,ft*2/corte))
print("TOTAL FTs = %.2f m3 | Corte geom = %.2f | Corte x1,40 = %.2f" % (tot,tc,tc*1.4))
print("Cobertura vs corte geom: %.1f%%  vs corte empolado: %.1f%%" % (tot/tc*100, tot/(tc*1.4)*100))
print()
print('=== POR TANQUE / POR FT ===')
for n,tag,prod,q,r1,esp,corte,reat,X in linhas:
    print("%s: corte/tq=%9.2f reat/tq=%9.2f | corte/FT=%9.2f reat/FT=%9.2f bacia/FT=%8.2f" % (n,corte/q,reat/q,corte/2,reat/2,(corte-reat)/2))
print()
print("BOTA-FORA geom=%.2f  x1,30=%.2f  x1,40=%.2f" % (tc,tc*1.30,tc*1.4))
print("RACHAO in situ=%.2f" % tr)
print("Soma bases planilha=%.2f" % tx)
