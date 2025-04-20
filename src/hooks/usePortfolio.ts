import { useState, useCallback, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContext from '../context/AuthContext';

// Types pour le portefeuille d'investissement
export type AssetType = 'stock' | 'crypto' | 'forex' | 'commodity' | 'bond' | 'etf' | 'real_estate' | 'brvm' | 'african_exchange';
export type TransactionType = 'buy' | 'sell' | 'dividend' | 'deposit' | 'withdrawal' | 'interest';
export type AssetStatus = 'active' | 'sold' | 'pending';

// Types spécifiques pour les bourses africaines
export type AfricanExchange = 'brvm' | 'jse' | 'nse' | 'gse' | 'ese' | 'luse' | 'dse' | 'use';

export interface AfricanMarketInfo {
    exchange: AfricanExchange;
    name: string;
    country: string | string[];
    currency: string;
    timezone: string;
}

export const AFRICAN_MARKETS: Record<AfricanExchange, AfricanMarketInfo> = {
    brvm: {
        exchange: 'brvm',
        name: 'Bourse Régionale des Valeurs Mobilières',
        country: ['Bénin', 'Burkina Faso', 'Côte d\'Ivoire', 'Guinée-Bissau', 'Mali', 'Niger', 'Sénégal', 'Togo'],
        currency: 'XOF',
        timezone: 'UTC+0'
    },
    jse: {
        exchange: 'jse',
        name: 'Johannesburg Stock Exchange',
        country: 'Afrique du Sud',
        currency: 'ZAR',
        timezone: 'UTC+2'
    },
    nse: {
        exchange: 'nse',
        name: 'Nigerian Stock Exchange',
        country: 'Nigeria',
        currency: 'NGN',
        timezone: 'UTC+1'
    },
    gse: {
        exchange: 'gse',
        name: 'Ghana Stock Exchange',
        country: 'Ghana',
        currency: 'GHS',
        timezone: 'UTC+0'
    },
    ese: {
        exchange: 'ese',
        name: 'Egyptian Exchange',
        country: 'Égypte',
        currency: 'EGP',
        timezone: 'UTC+2'
    },
    luse: {
        exchange: 'luse',
        name: 'Lusaka Stock Exchange',
        country: 'Zambie',
        currency: 'ZMW',
        timezone: 'UTC+2'
    },
    dse: {
        exchange: 'dse',
        name: 'Dar es Salaam Stock Exchange',
        country: 'Tanzanie',
        currency: 'TZS',
        timezone: 'UTC+3'
    },
    use: {
        exchange: 'use',
        name: 'Uganda Securities Exchange',
        country: 'Ouganda',
        currency: 'UGX',
        timezone: 'UTC+3'
    }
};

export interface Asset {
        id: string;
        name: string;
        ticker: string;
        type: AssetType;
        quantity: number;
        purchasePrice: number;
        currentPrice: number;
        purchaseDate: Date;
        status: AssetStatus;
        lastUpdated: Date;
        // Nouveaux champs pour les bourses africaines
        exchange?: AfricanExchange;
        currency?: string;
}

export interface Transaction {
        id: string;
        assetId: string;
        type: TransactionType;
        date: Date;
        quantity: number;
        price: number;
        fees: number;
        notes?: string;
        currency?: string;
        exchangeRate?: number; // Taux de change à la date de la transaction
}

export interface PortfolioSummary {
        totalValue: number;
        totalInvestment: number;
        totalProfit: number;
        profitPercentage: number;
        assetAllocation: Record<AssetType, number>;
        performanceHistory: Array<{ date: Date; value: number }>;
        // Ajout d'allocation par bourse/région
        exchangeAllocation: Record<string, number>;
        currencyExposure: Record<string, number>;
}

interface PortfolioState {
        assets: Asset[];
        transactions: Transaction[];
        summary: PortfolioSummary;
        lastRefresh: Date | null;
}

const INITIAL_PORTFOLIO: PortfolioState = {
        assets: [],
        transactions: [],
        summary: {
                totalValue: 0,
                totalInvestment: 0,
                totalProfit: 0,
                profitPercentage: 0,
                assetAllocation: {
                        stock: 0,
                        crypto: 0,
                        forex: 0,
                        commodity: 0,
                        bond: 0,
                        etf: 0,
                        real_estate: 0,
                        brvm: 0,
                        african_exchange: 0
                },
                exchangeAllocation: {
                        brvm: 0,
                        jse: 0,
                        nse: 0,
                        gse: 0,
                        ese: 0,
                        luse: 0,
                        dse: 0,
                        use: 0,
                        other: 0
                },
                currencyExposure: {
                        XOF: 0,
                        USD: 0,
                        EUR: 0,
                        ZAR: 0,
                        NGN: 0,
                        GHS: 0,
                        EGP: 0
                },
                performanceHistory: []
        },
        lastRefresh: null
};

/**
 * Hook pour gérer le portefeuille d'investissement de l'utilisateur
 * Fournit des fonctions pour ajouter, modifier et suivre les actifs et transactions
 */
export function usePortfolio() {
        // État du portefeuille
        const [portfolio, setPortfolio] = useState<PortfolioState>(INITIAL_PORTFOLIO);
        const [loading, setLoading] = useState(false);
        const [refreshing, setRefreshing] = useState(false);
        const [error, setError] = useState<string | null>(null);
        
        // Récupérer le contexte d'authentification
        const authContext = useContext(AuthContext);
        
        // Charger les données du portefeuille depuis le stockage
        useEffect(() => {
                const loadPortfolioData = async () => {
                        try {
                                setLoading(true);
                                const storedData = await AsyncStorage.getItem('portfolio_data');
                                
                                if (storedData) {
                                        const parsedData = JSON.parse(storedData);
                                        
                                        // Conversion des dates string en objets Date
                                        if (parsedData.assets) {
                                                parsedData.assets = parsedData.assets.map((asset: any) => ({
                                                        ...asset,
                                                        purchaseDate: new Date(asset.purchaseDate),
                                                        lastUpdated: new Date(asset.lastUpdated)
                                                }));
                                        }
                                        
                                        if (parsedData.transactions) {
                                                parsedData.transactions = parsedData.transactions.map((tx: any) => ({
                                                        ...tx,
                                                        date: new Date(tx.date)
                                                }));
                                        }
                                        
                                        if (parsedData.summary?.performanceHistory) {
                                                parsedData.summary.performanceHistory = parsedData.summary.performanceHistory.map(
                                                        (item: any) => ({ ...item, date: new Date(item.date) })
                                                );
                                        }
                                        
                                        if (parsedData.lastRefresh) {
                                                parsedData.lastRefresh = new Date(parsedData.lastRefresh);
                                        }
                                        
                                        // Assurer la rétrocompatibilité avec les nouveaux champs ajoutés
                                        if (!parsedData.summary.exchangeAllocation) {
                                                parsedData.summary.exchangeAllocation = INITIAL_PORTFOLIO.summary.exchangeAllocation;
                                        }
                                        
                                        if (!parsedData.summary.currencyExposure) {
                                                parsedData.summary.currencyExposure = INITIAL_PORTFOLIO.summary.currencyExposure;
                                        }
                                        
                                        // Assurer que assetAllocation contient les nouveaux types d'actifs
                                        if (!parsedData.summary.assetAllocation.brvm) {
                                                parsedData.summary.assetAllocation.brvm = 0;
                                        }
                                        
                                        if (!parsedData.summary.assetAllocation.african_exchange) {
                                                parsedData.summary.assetAllocation.african_exchange = 0;
                                        }
                                        
                                        setPortfolio(parsedData);
                                }
                        } catch (err) {
                                setError("Erreur lors du chargement des données du portefeuille");
                                console.error("Erreur de chargement du portefeuille:", err);
                        } finally {
                                setLoading(false);
                        }
                };
                
                if (authContext?.isAuthenticated) {
                        loadPortfolioData();
                }
        }, [authContext?.isAuthenticated]);
        
        // Sauvegarder les données du portefeuille
        const savePortfolioData = async (data: PortfolioState) => {
                try {
                        await AsyncStorage.setItem('portfolio_data', JSON.stringify(data));
                } catch (err) {
                        console.error("Erreur lors de la sauvegarde des données du portefeuille:", err);
                        throw new Error("Impossible de sauvegarder les données du portefeuille");
                }
        };
        
        // Calculer le résumé du portefeuille
        const calculateSummary = useCallback((assets: Asset[], transactions: Transaction[]): PortfolioSummary => {
                // Initialiser les valeurs
                let totalValue = 0;
                let totalInvestment = 0;
                const assetAllocation: Record<AssetType, number> = {
                        stock: 0,
                        crypto: 0,
                        forex: 0,
                        commodity: 0,
                        bond: 0,
                        etf: 0,
                        real_estate: 0,
                        brvm: 0,
                        african_exchange: 0
                };
                
                // Initialiser l'allocation par bourse et exposition aux devises
                const exchangeAllocation: Record<string, number> = {
                        brvm: 0,
                        jse: 0,
                        nse: 0,
                        gse: 0,
                        ese: 0,
                        luse: 0,
                        dse: 0,
                        use: 0,
                        other: 0
                };
                
                const currencyExposure: Record<string, number> = {
                        XOF: 0,
                        USD: 0,
                        EUR: 0,
                        ZAR: 0,
                        NGN: 0,
                        GHS: 0,
                        EGP: 0
                };
                
                // Calculer les totaux et l'allocation des actifs
                assets.forEach(asset => {
                        if (asset.status === 'active') {
                                const assetValue = asset.quantity * asset.currentPrice;
                                const investmentValue = asset.quantity * asset.purchasePrice;
                                
                                totalValue += assetValue;
                                totalInvestment += investmentValue;
                                assetAllocation[asset.type] += assetValue;
                                
                                // Allocation par bourse
                                if (asset.exchange) {
                                        exchangeAllocation[asset.exchange] = (exchangeAllocation[asset.exchange] || 0) + assetValue;
                                } else {
                                        exchangeAllocation.other += assetValue;
                                }
                                
                                // Exposition aux devises
                                if (asset.currency) {
                                        currencyExposure[asset.currency] = (currencyExposure[asset.currency] || 0) + assetValue;
                                } else if (asset.type === 'brvm') {
                                        currencyExposure.XOF += assetValue;
                                } else {
                                        currencyExposure.USD += assetValue; // Par défaut en USD si non spécifié
                                }
                        }
                });
                
                // Calculer le profit total et le pourcentage
                const totalProfit = totalValue - totalInvestment;
                const profitPercentage = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;
                
                // Convertir l'allocation des actifs en pourcentages
                for (const assetType in assetAllocation) {
                        if (totalValue > 0) {
                                assetAllocation[assetType as AssetType] = (assetAllocation[assetType as AssetType] / totalValue) * 100;
                        } else {
                                assetAllocation[assetType as AssetType] = 0;
                        }
                }
                
                // Convertir l'allocation par bourse en pourcentages
                for (const exchange in exchangeAllocation) {
                        if (totalValue > 0) {
                                exchangeAllocation[exchange] = (exchangeAllocation[exchange] / totalValue) * 100;
                        } else {
                                exchangeAllocation[exchange] = 0;
                        }
                }
                
                // Convertir l'exposition aux devises en pourcentages
                for (const currency in currencyExposure) {
                        if (totalValue > 0) {
                                currencyExposure[currency] = (currencyExposure[currency] / totalValue) * 100;
                        } else {
                                currencyExposure[currency] = 0;
                        }
                }
                
                // Récupérer l'historique de performance existant
                const existingHistory = portfolio.summary?.performanceHistory || [];
                
                // Ajouter une nouvelle entrée pour aujourd'hui
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                // Vérifier si nous avons déjà une entrée pour aujourd'hui
                const todayExists = existingHistory.some(
                        entry => entry.date.toDateString() === today.toDateString()
                );
                
                let performanceHistory = [...existingHistory];
                
                if (!todayExists) {
                        performanceHistory.push({ date: today, value: totalValue });
                        // Garder seulement les 90 derniers jours
                        if (performanceHistory.length > 90) {
                                performanceHistory = performanceHistory.slice(-90);
                        }
                }
                
                return {
                        totalValue,
                        totalInvestment,
                        totalProfit,
                        profitPercentage,
                        assetAllocation,
                        exchangeAllocation,
                        currencyExposure,
                        performanceHistory
                };
        }, [portfolio.summary]);
        
        // Ajouter un nouvel actif
        const addAsset = useCallback(async (newAsset: Omit<Asset, 'id' | 'lastUpdated'>) => {
                try {
                        setLoading(true);
                        
                        const asset: Asset = {
                                ...newAsset,
                                id: Date.now().toString(),
                                lastUpdated: new Date()
                        };
                        
                        // Définir automatiquement la devise pour la BRVM
                        if (asset.type === 'brvm' && !asset.currency) {
                                asset.currency = 'XOF';
                                asset.exchange = 'brvm';
                        }
                        
                        const updatedAssets = [...portfolio.assets, asset];
                        
                        // Ajouter la transaction d'achat correspondante
                        const purchaseTransaction: Transaction = {
                                id: Date.now().toString() + '-purchase',
                                assetId: asset.id,
                                type: 'buy',
                                date: asset.purchaseDate,
                                quantity: asset.quantity,
                                price: asset.purchasePrice,
                                fees: 0, // À personnaliser si nécessaire
                                currency: asset.currency
                        };
                        
                        const updatedTransactions = [...portfolio.transactions, purchaseTransaction];
                        
                        // Recalculer le résumé
                        const summary = calculateSummary(updatedAssets, updatedTransactions);
                        
                        const updatedPortfolio = {
                                ...portfolio,
                                assets: updatedAssets,
                                transactions: updatedTransactions,
                                summary,
                                lastRefresh: new Date()
                        };
                        
                        setPortfolio(updatedPortfolio);
                        await savePortfolioData(updatedPortfolio);
                        
                        return asset;
                } catch (err) {
                        setError("Erreur lors de l'ajout d'un actif");
                        console.error("Erreur d'ajout d'actif:", err);
                        throw err;
                } finally {
                        setLoading(false);
                }
        }, [portfolio, calculateSummary]);
        
        // Le reste du code reste inchangé...
        
        // Ajouter une transaction
        const addTransaction = useCallback(async (newTransaction: Omit<Transaction, 'id'>) => {
                try {
                        setLoading(true);
                        
                        const transaction: Transaction = {
                                ...newTransaction,
                                id: Date.now().toString()
                        };
                        
                        // Mise à jour des actifs concernés
                        const updatedAssets = [...portfolio.assets];
                        const assetIndex = updatedAssets.findIndex(a => a.id === transaction.assetId);
                        
                        if (assetIndex === -1) {
                                throw new Error("Actif non trouvé");
                        }
                        
                        const asset = updatedAssets[assetIndex];
                        let updatedAsset = { ...asset };
                        
                        // Mettre à jour l'actif en fonction du type de transaction
                        switch (transaction.type) {
                                case 'buy':
                                        // Calculer le nouveau prix d'achat moyen pondéré
                                        const totalQuantity = asset.quantity + transaction.quantity;
                                        const totalValue = (asset.quantity * asset.purchasePrice) + (transaction.quantity * transaction.price);
                                        updatedAsset = {
                                                ...updatedAsset,
                                                quantity: totalQuantity,
                                                purchasePrice: totalValue / totalQuantity,
                                                lastUpdated: new Date()
                                        };
                                        break;
                                case 'sell':
                                        const remainingQuantity = asset.quantity - transaction.quantity;
                                        updatedAsset = {
                                                ...updatedAsset,
                                                quantity: remainingQuantity,
                                                status: remainingQuantity <= 0 ? 'sold' : 'active',
                                                lastUpdated: new Date()
                                        };
                                        break;
                                // Autres types à implémenter selon les besoins
                        }
                        
                        updatedAssets[assetIndex] = updatedAsset;
                        
                        const updatedTransactions = [...portfolio.transactions, transaction];
                        
                        // Recalculer le résumé
                        const summary = calculateSummary(updatedAssets, updatedTransactions);
                        
                        const updatedPortfolio = {
                                ...portfolio,
                                assets: updatedAssets,
                                transactions: updatedTransactions,
                                summary,
                                lastRefresh: new Date()
                        };
                        
                        setPortfolio(updatedPortfolio);
                        await savePortfolioData(updatedPortfolio);
                        
                        return transaction;
                } catch (err) {
                        setError("Erreur lors de l'ajout d'une transaction");
                        console.error("Erreur d'ajout de transaction:", err);
                        throw err;
                } finally {
                        setLoading(false);
                }
        }, [portfolio, calculateSummary]);
        
        // Mettre à jour les prix actuels des actifs
        const refreshPrices = useCallback(async () => {
                try {
                        setRefreshing(true);
                        
                        // Dans une application réelle, appeler une API de prix ici
                        // Pour les bourses africaines, vous pourriez avoir besoin d'API spécifiques
                        // Exemple: const brvmPrices = await fetchBRVMPrices();
                        // Exemple: const otherAfricanPrices = await fetchAfricanExchangePrices();
                        
                        // Simulation d'une mise à jour des prix (±5%)
                        const updatedAssets = portfolio.assets.map(asset => {
                                if (asset.status === 'active') {
                                        // Variation aléatoire plus faible pour les actifs BRVM pour plus de réalisme
                                        const priceChange = asset.type === 'brvm' ? 
                                                                             (Math.random() * 0.05 - 0.025) : // -2.5% à +2.5% pour BRVM
                                                                             (Math.random() * 0.1 - 0.05);    // -5% à +5% pour autres
                                        
                                        const newPrice = asset.currentPrice * (1 + priceChange);
                                        
                                        return {
                                                ...asset,
                                                currentPrice: newPrice,
                                                lastUpdated: new Date()
                                        };
                                }
                                return asset;
                        });
                        
                        // Recalculer le résumé
                        const summary = calculateSummary(updatedAssets, portfolio.transactions);
                        
                        const updatedPortfolio = {
                                ...portfolio,
                                assets: updatedAssets,
                                summary,
                                lastRefresh: new Date()
                        };
                        
                        setPortfolio(updatedPortfolio);
                        await savePortfolioData(updatedPortfolio);
                        
                        return true;
                } catch (err) {
                        setError("Erreur lors de la mise à jour des prix");
                        console.error("Erreur de rafraîchissement des prix:", err);
                        return false;
                } finally {
                        setRefreshing(false);
                }
        }, [portfolio, calculateSummary]);
        
        // Supprimer un actif et ses transactions associées
        const deleteAsset = useCallback(async (assetId: string) => {
                try {
                        setLoading(true);
                        
                        const updatedAssets = portfolio.assets.filter(asset => asset.id !== assetId);
                        const updatedTransactions = portfolio.transactions.filter(tx => tx.assetId !== assetId);
                        
                        // Recalculer le résumé
                        const summary = calculateSummary(updatedAssets, updatedTransactions);
                        
                        const updatedPortfolio = {
                                ...portfolio,
                                assets: updatedAssets,
                                transactions: updatedTransactions,
                                summary,
                                lastRefresh: new Date()
                        };
                        
                        setPortfolio(updatedPortfolio);
                        await savePortfolioData(updatedPortfolio);
                        
                        return true;
                } catch (err) {
                        setError("Erreur lors de la suppression de l'actif");
                        console.error("Erreur de suppression d'actif:", err);
                        return false;
                } finally {
                        setLoading(false);
                }
        }, [portfolio, calculateSummary]);
        
        // Obtenir l'historique des transactions pour un actif spécifique
        const getAssetTransactions = useCallback((assetId: string) => {
                return portfolio.transactions.filter(tx => tx.assetId === assetId);
        }, [portfolio.transactions]);
        
        // Obtenir la performance d'un actif spécifique
        const getAssetPerformance = useCallback((assetId: string) => {
                const asset = portfolio.assets.find(a => a.id === assetId);
                
                if (!asset) {
                        return null;
                }
                
                const currentValue = asset.quantity * asset.currentPrice;
                const investmentValue = asset.quantity * asset.purchasePrice;
                const profit = currentValue - investmentValue;
                const profitPercentage = investmentValue > 0 ? (profit / investmentValue) * 100 : 0;
                
                return {
                        asset,
                        currentValue,
                        investmentValue,
                        profit,
                        profitPercentage
                };
        }, [portfolio.assets]);
        
        // Obtenir des détails sur un marché africain spécifique
        const getAfricanMarketInfo = useCallback((exchange: AfricanExchange) => {
                return AFRICAN_MARKETS[exchange];
        }, []);
        
        // Récupérer les actifs par type de bourse africaine
        const getAssetsByAfricanExchange = useCallback((exchange: AfricanExchange) => {
                return portfolio.assets.filter(asset => asset.exchange === exchange && asset.status === 'active');
        }, [portfolio.assets]);
        
        return {
                portfolio,
                loading,
                refreshing,
                error,
                addAsset,
                addTransaction,
                refreshPrices,
                deleteAsset,
                getAssetTransactions,
                getAssetPerformance,
                getAfricanMarketInfo,
                getAssetsByAfricanExchange,
                africanMarkets: AFRICAN_MARKETS
        };
}