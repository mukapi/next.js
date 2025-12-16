# Formulaire Transaction - Compte rendu de compréhension

## Objectif
Formulaire multi-step qui calcule automatiquement le prix d'un pack de diagnostics immobiliers en fonction des réponses de l'utilisateur.

---

## Étapes du formulaire

### Étape 1 : Type de projet
- **Location** → inclut : Boutin + ERP + DPE
- **Vente** → inclut : Carrez + Termite + ERP + DPE

### Étape 2 : Type de bien
- Appartement
- Maison individuelle
- Cave/parking

### Étape 3 : Localisation
- Adresse
- Ville / CP
- **Frais de déplacement depuis Nantes 44000 :**
  - 0-20 km : inclus
  - 20-30 km : +20€
  - 30-50 km : +40€
  - 50-80 km : +60€
  - > 80 km : Contact

### Étape 4 : Surface en m2
Détermine la tranche tarifaire :

| Type | Tranche 1 | Tranche 2 | Tranche 3 | Tranche 4 |
|------|-----------|-----------|-----------|-----------|
| Appartement | ≤45m² | ≤90m² | ≤120m² | >120m² (Contact) |
| Maison individuelle | ≤80m² | ≤120m² | ≤170m² | >170m² (Contact) |
| Cave/parking | Toute surface | - | - | - |

### Étape 5 : Date de construction
- **< 1997** → Ajouter diagnostic **Amiante**
- **< 1948** → Ajouter diagnostic **Plomb**

### Étape 6 : Installation électrique
- Présence ? (Oui/Non)
- Si OUI → Installation > 15 ans ?
  - OUI → Ajouter diagnostic **Elec**
  - NON → Pas de diag Elec

### Étape 7 : Installation gaz
- Présence ? (Oui/Non)
- Si OUI → Installation > 15 ans ?
  - OUI → Ajouter diagnostic **Gaz**
  - NON → Pas de diag Gaz

---

## Grille tarifaire

### Appartements

| Diagnostic | ≤45m² | ≤90m² | ≤120m² | >120m² |
|------------|-------|-------|--------|--------|
| **Pack forfaitaire vente** | 230€ | 260€ | 310€ | Contact |
| **Pack forfaitaire location** | 200€ | 240€ | 290€ | Contact |
| DPE | 100€ | 110€ | 140€ | Contact |
| Elec, Gaz, Amiante*, Termites | 85€ | 95€ | 100€ | Contact |
| ERP, Carrez*, Boutin* | 25€ | 30€ | 40€ | Contact |
| Plomb | Contact | Contact | Contact | Contact |

### Maisons individuelles

| Diagnostic | ≤80m² | ≤120m² | ≤170m² | >170m² |
|------------|-------|--------|--------|--------|
| **Pack forfaitaire vente** | 300€ | 360€ | 420€ | Contact |
| **Pack forfaitaire location** | 275€ | 330€ | 390€ | Contact |
| DPE | 130€ | 150€ | 180€ | Contact |
| Elec, Gaz, Amiante*, Termites | 75€ | 90€ | 100€ | Contact |
| ERP, Carrez*, Boutin* | 35€ | 45€ | 55€ | Contact |
| Plomb | Contact | Contact | Contact | Contact |

### Cave et parking

| Diagnostic | Prix |
|------------|------|
| ERP | 25€ |
| Amiante | 75€ |
| Termites | 75€ |
| **Tous les diags** | 140€ |

---

## Logique de calcul du prix

### Option 1 : Pack forfaitaire
Le pack inclut déjà les diagnostics de base. Prix fixe selon surface.

**Pack Vente** = DPE + Carrez + ERP + Termites (+ Elec/Gaz/Amiante/Plomb selon conditions)
**Pack Location** = DPE + Boutin + ERP (+ Elec/Gaz selon conditions)

### Option 2 : À la carte
Additionner les diagnostics individuels selon les réponses.

---

## Questions à clarifier

1. **Le pack forfaitaire inclut-il Elec/Gaz/Amiante ?**
   - Ou sont-ils en supplément si les conditions sont remplies ?

2. **Plomb = toujours "Contact" ?**
   - Pas de prix fixe dans le tableau

3. **Comment gérer le multi-select ?**
   - L'utilisateur choisit-il "Pack" ou "À la carte" ?
   - Ou le formulaire calcule-t-il automatiquement le meilleur prix ?

4. **Les prix Elec/Gaz/Amiante/Termites sont groupés dans le tableau**
   - C'est le prix unitaire pour chacun ?
   - Ou c'est un pack de ces 4 diagnostics ?

---

## Proposition de flow simplifié

```
1. Vente ou Location ?
   ↓
2. Type de bien ?
   ↓
3. Adresse + Code postal → calcul distance
   ↓
4. Surface en m² → détermination tranche tarifaire
   ↓
5. Année de construction ?
   - < 1948 → Plomb + Amiante obligatoires
   - 1948-1997 → Amiante obligatoire
   - > 1997 → Aucun
   ↓
6. Installation électrique > 15 ans ? → Elec obligatoire
   ↓
7. Installation gaz > 15 ans ? → Gaz obligatoire
   ↓
8. RÉSULTAT : Affichage du prix total + détail des diagnostics inclus
```

---

## Remarques

- Les diagnostics marqués d'un * (Carrez*, Boutin*, Amiante*) semblent avoir des conditions spécifiques
- Le formulaire actuel en haut de page n'est PAS multi-step, il faudrait le reconstruire
- Pour un vrai multi-step dans Webflow, tu peux utiliser des tabs ou du JS custom
