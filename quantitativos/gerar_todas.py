# -*- coding: utf-8 -*-
"""Regera as cinco planilhas de quantitativo, uma por prancha."""
import os, subprocess, sys
AQUI = os.path.dirname(os.path.abspath(__file__))
SCRIPTS = ["gerar_arm_6310816_817.py", "gerar_arm_6310818.py", "gerar_arm_6312824.py",
           "gerar_for_6310818.py", "gerar_for_6312824.py"]
for s in SCRIPTS:
    print("=" * 70)
    print(s)
    subprocess.run([sys.executable, os.path.join(AQUI, s)], check=True)
