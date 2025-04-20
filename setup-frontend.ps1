<#
PowerShell script pour créer la structure frontend de l'application mobile React Native Expo sous Windows
#>

param(
    [string]$ProjectName = ""
)

Write-Host "Création de la structure frontend dans $ProjectName..."

# Fonction pour créer un dossier s'il n'existe pas
function Create-Dir {
    param([string]$Path)
    if (-not (Test-Path -Path $Path)) {
        New-Item -Path $Path -ItemType Directory | Out-Null
        Write-Host "Dossier créé : $Path"
    } else {
        Write-Host "Dossier existe déjà : $Path"
    }
}

# Fonction pour créer un fichier s'il n'existe pas
function Create-File {
    param([string]$Path)
    $dir = Split-Path -Path $Path
n    if (-not (Test-Path -Path $dir)) {
        New-Item -Path $dir -ItemType Directory | Out-Null
    }
    if (-not (Test-Path -Path $Path)) {
        New-Item -Path $Path -ItemType File | Out-Null
        Write-Host "Fichier créé : $Path"
    } else {
        Write-Host "Fichier existe déjà : $Path"
    }
}

# Chemin de base
$base = Join-Path -Path (Get-Location) -ChildPath $ProjectName

# Dossiers principaux
$dirs = @(
    "src/api",
    "src/components",
    "src/context",
    "src/navigation",
    "src/screens/auth",
    "src/screens/explore",
    "src/screens/portfolio",
    "src/screens/crowdfunding",
    "src/screens/wallet",
    "src/screens/dashboard"
)
foreach ($d in $dirs) {
    Create-Dir -Path (Join-Path $base $d)
}

# Fichiers à la racine
$rootFiles = @(
    "App.tsx",
    "package.json",
    "tsconfig.json"
)
foreach ($f in $rootFiles) {
    Create-File -Path (Join-Path $base $f)
}

# Fichiers API frontend
Create-File -Path (Join-Path $base "src/api/client.ts")

# Composants UI frontend
Create-File -Path (Join-Path $base "src/components/ButtonPrimary.tsx")
Create-File -Path (Join-Path $base "src/components/InputField.tsx")

# Contexte Auth frontend
Create-File -Path (Join-Path $base "src/context/AuthContext.tsx")

# Navigators frontend
Create-File -Path (Join-Path $base "src/navigation/AuthNavigator.tsx")
Create-File -Path (Join-Path $base "src/navigation/MainNavigator.tsx")

# Écrans Auth frontend
Create-File -Path (Join-Path $base "src/screens/auth/LoginScreen.tsx")
Create-File -Path (Join-Path $base "src/screens/auth/RegisterScreen.tsx")
Create-File -Path (Join-Path $base "src/screens/auth/KycScreen.tsx")

# Écrans principaux frontend
$mainScreens = @(
    "ExploreScreen.tsx",
    "PortfolioScreen.tsx",
    "CrowdfundingScreen.tsx",
    "WalletScreen.tsx",
    "DashboardScreen.tsx"
)
foreach ($screen in $mainScreens) {
    Create-File -Path (Join-Path $base "src/screens/explore/$screen")
    if ($screen -ne "ExploreScreen.tsx") {
        # Map each screen into its folder
        $folder = switch ($screen) {
            "PortfolioScreen.tsx"    { "portfolio" }
            "CrowdfundingScreen.tsx" { "crowdfunding" }
            "WalletScreen.tsx"       { "wallet" }
            "DashboardScreen.tsx"    { "dashboard" }
            default                    { "explore" }
        }
        Create-File -Path (Join-Path $base ("src/screens/$folder/$screen"))
    }
}

Write-Host "Structure frontend Windows créée avec succès !"
