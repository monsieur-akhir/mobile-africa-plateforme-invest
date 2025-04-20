import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';

// Types
interface StockData {
    id: string;
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
}

interface MarketOverview {
    brvm_composite: {
        value: number;
        change: number;
        changePercent: number;
    },
    brvm_10: {
        value: number;
        change: number;
        changePercent: number;
    }
}

const HomeScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp<ParamListBase>>();
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [marketOverview, setMarketOverview] = useState<MarketOverview | null>(null);
    const [topStocks, setTopStocks] = useState<StockData[]>([]);
    const [recentlyViewed, setRecentlyViewed] = useState<StockData[]>([]);
    const [watchlist, setWatchlist] = useState<StockData[]>([]);

    // Fonction pour charger les données
    const loadData = async () => {
        try {
            setLoading(true);
            
            // Ces endpoints sont fictifs, ils doivent être remplacés par les API réelles
            const marketResponse = await axios.get('https://api.example.com/brvm/market-overview');
            const topStocksResponse = await axios.get('https://api.example.com/brvm/top-performers');
            
            // Charger les données sauvegardées localement pour recently viewed et watchlist
            // Ici, vous implémenteriez un vrai stockage local comme AsyncStorage
            
            setMarketOverview(marketResponse.data);
            setTopStocks(topStocksResponse.data.slice(0, 5));
            
            // Données d'exemple, à remplacer par des données réelles
            setRecentlyViewed([
                { id: '1', symbol: 'BICC', name: 'BICI Côte d\'Ivoire', price: 6400, change: 100, changePercent: 1.59 },
                { id: '2', symbol: 'SNTS', name: 'Sonatel Sénégal', price: 13500, change: -150, changePercent: -1.10 },
            ]);
            
            setWatchlist([
                { id: '3', symbol: 'ETIT', name: 'Ecobank Transnational Inc', price: 20, change: 0.5, changePercent: 2.56 },
                { id: '4', symbol: 'SGBC', name: 'Société Générale de Banques en CI', price: 10300, change: 300, changePercent: 3.00 },
                { id: '5', symbol: 'NSBC', name: 'NSIA Banque', price: 5800, change: -125, changePercent: -2.11 },
            ]);
            
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            // Implémentez un gestionnaire d'erreurs ici
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Charger les données au démarrage
    useEffect(() => {
        loadData();
    }, []);

    // Fonction pour rafraîchir les données
    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    // Fonction pour naviguer vers l'écran de détails d'une action
    const navigateToStockDetails = (stock: StockData) => {
        navigation.navigate('StockDetails', { stock });
    };

    // Fonction pour naviguer vers l'écran du marché BRVM
    const navigateToBRVMMarket = () => {
        navigation.navigate('BRVMMarket');
    };

    // Fonction pour naviguer vers le portefeuille
    const navigateToPortfolio = () => {
        navigation.navigate('Portfolio');
    };

    // Fonction pour afficher la variation des prix avec couleur appropriée
    const renderPriceChange = (change: number, changePercent: number) => {
        const color = change >= 0 ? '#4CAF50' : '#F44336';
        const icon = change >= 0 ? 'caret-up' : 'caret-down';
        
        return (
            <View style={styles.priceChangeContainer}>
                <Text style={[styles.priceChange, { color }]}>
                    {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
                </Text>
                <FontAwesome5 name={icon} size={12} color={color} style={styles.changeIcon} />
            </View>
        );
    };

    // Fonction pour rendre un élément d'action
    const renderStockItem = (stock: StockData) => {
        return (
            <TouchableOpacity 
                key={stock.id} 
                style={styles.stockItem}
                onPress={() => navigateToStockDetails(stock)}
            >
                <View style={styles.stockInfo}>
                    <Text style={styles.stockSymbol}>{stock.symbol}</Text>
                    <Text style={styles.stockName} numberOfLines={1}>{stock.name}</Text>
                </View>
                <View style={styles.stockPriceContainer}>
                    <Text style={styles.stockPrice}>{stock.price.toLocaleString()} FCFA</Text>
                    {renderPriceChange(stock.change, stock.changePercent)}
                </View>
            </TouchableOpacity>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0066CC" />
                <Text style={styles.loadingText}>Chargement des données...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* En-tête */}
                <View style={styles.header}>
                    <Text style={styles.title}>Investir en BRVM</Text>
                    <TouchableOpacity style={styles.notificationButton}>
                        <MaterialIcons name="notifications" size={24} color="#333" />
                    </TouchableOpacity>
                </View>

                {/* Aperçu du marché BRVM */}
                <TouchableOpacity 
                    style={styles.marketOverviewCard}
                    onPress={navigateToBRVMMarket}
                >
                    <Text style={styles.sectionTitle}>Aperçu du marché BRVM</Text>
                    {marketOverview ? (
                        <View style={styles.marketIndices}>
                            <View style={styles.indexContainer}>
                                <Text style={styles.indexName}>BRVM Composite</Text>
                                <Text style={styles.indexValue}>{marketOverview.brvm_composite.value.toFixed(2)}</Text>
                                {renderPriceChange(
                                    marketOverview.brvm_composite.change, 
                                    marketOverview.brvm_composite.changePercent
                                )}
                            </View>
                            <View style={styles.indexContainer}>
                                <Text style={styles.indexName}>BRVM 10</Text>
                                <Text style={styles.indexValue}>{marketOverview.brvm_10.value.toFixed(2)}</Text>
                                {renderPriceChange(
                                    marketOverview.brvm_10.change, 
                                    marketOverview.brvm_10.changePercent
                                )}
                            </View>
                        </View>
                    ) : (
                        <Text style={styles.noDataText}>Données du marché non disponibles</Text>
                    )}
                    <TouchableOpacity style={styles.viewMoreButton}>
                        <Text style={styles.viewMoreText}>Voir plus</Text>
                        <MaterialIcons name="arrow-forward" size={16} color="#0066CC" />
                    </TouchableOpacity>
                </TouchableOpacity>

                {/* Actions populaires */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Actions les plus performantes</Text>
                    {topStocks.length > 0 ? (
                        <View style={styles.stocksContainer}>
                            {topStocks.map(stock => renderStockItem(stock))}
                        </View>
                    ) : (
                        <Text style={styles.noDataText}>Aucune donnée disponible</Text>
                    )}
                    <TouchableOpacity style={styles.viewMoreButton}>
                        <Text style={styles.viewMoreText}>Voir toutes les actions</Text>
                        <MaterialIcons name="arrow-forward" size={16} color="#0066CC" />
                    </TouchableOpacity>
                </View>

                {/* Actions récemment consultées */}
                {recentlyViewed.length > 0 && (
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Récemment consultées</Text>
                        <View style={styles.stocksContainer}>
                            {recentlyViewed.map(stock => renderStockItem(stock))}
                        </View>
                    </View>
                )}

                {/* Ma liste de suivi */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Ma liste de suivi</Text>
                    {watchlist.length > 0 ? (
                        <View style={styles.stocksContainer}>
                            {watchlist.map(stock => renderStockItem(stock))}
                        </View>
                    ) : (
                        <View style={styles.emptyWatchlist}>
                            <FontAwesome5 name="search-dollar" size={40} color="#CCCCCC" />
                            <Text style={styles.emptyWatchlistText}>
                                Votre liste de suivi est vide
                            </Text>
                            <Text style={styles.emptyWatchlistSubtext}>
                                Ajoutez des actions pour suivre leur performance
                            </Text>
                        </View>
                    )}
                </View>

                {/* Portfolio résumé */}
                <TouchableOpacity 
                    style={styles.portfolioCard}
                    onPress={navigateToPortfolio}
                >
                    <View style={styles.portfolioHeader}>
                        <Text style={styles.sectionTitle}>Mon portefeuille</Text>
                        <MaterialIcons name="account-balance-wallet" size={24} color="#0066CC" />
                    </View>
                    <View style={styles.portfolioSummary}>
                        <View style={styles.portfolioValueContainer}>
                            <Text style={styles.portfolioValueLabel}>Valeur totale</Text>
                            <Text style={styles.portfolioValue}>2,450,000 FCFA</Text>
                            <Text style={styles.portfolioChange}>+45,000 (1.87%)</Text>
                        </View>
                        <View style={styles.portfolioStatsContainer}>
                            <View style={styles.portfolioStat}>
                                <Text style={styles.portfolioStatLabel}>Actions</Text>
                                <Text style={styles.portfolioStatValue}>7</Text>
                            </View>
                            <View style={styles.portfolioStat}>
                                <Text style={styles.portfolioStatLabel}>Rendement</Text>
                                <Text style={styles.portfolioStatValue}>8.2%</Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Actualités du marché - Aperçu */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Actualités du marché</Text>
                    <TouchableOpacity style={styles.newsItem}>
                        <Text style={styles.newsTitle}>La BRVM enregistre une performance exceptionnelle au premier trimestre</Text>
                        <Text style={styles.newsDate}>Il y a 2 heures</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.newsItem}>
                        <Text style={styles.newsTitle}>Sonatel annonce une augmentation de dividende de 10%</Text>
                        <Text style={styles.newsDate}>Hier</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.viewMoreButton}>
                        <Text style={styles.viewMoreText}>Toutes les actualités</Text>
                        <MaterialIcons name="arrow-forward" size={16} color="#0066CC" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
            
            {/* Bouton flottant pour acheter des actions */}
            <TouchableOpacity style={styles.floatingButton}>
                <MaterialIcons name="add" size={30} color="#FFFFFF" />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F8FA',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    notificationButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
    },
    marketOverviewCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    marketIndices: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    indexContainer: {
        flex: 1,
        paddingHorizontal: 8,
    },
    indexName: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    indexValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    sectionContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    stocksContainer: {
        marginBottom: 8,
    },
    stockItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    stockInfo: {
        flex: 1,
    },
    stockSymbol: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    stockName: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    stockPriceContainer: {
        alignItems: 'flex-end',
    },
    stockPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    priceChangeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceChange: {
        fontSize: 14,
        marginRight: 4,
    },
    changeIcon: {
        marginTop: 1,
    },
    viewMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        padding: 8,
    },
    viewMoreText: {
        fontSize: 14,
        color: '#0066CC',
        marginRight: 4,
    },
    noDataText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginVertical: 16,
    },
    emptyWatchlist: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    emptyWatchlistText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#666',
        marginTop: 12,
    },
    emptyWatchlistSubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginTop: 8,
    },
    portfolioCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    portfolioHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    portfolioSummary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    portfolioValueContainer: {
        flex: 1,
    },
    portfolioValueLabel: {
        fontSize: 14,
        color: '#666',
    },
    portfolioValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginVertical: 4,
    },
    portfolioChange: {
        fontSize: 14,
        color: '#4CAF50',
    },
    portfolioStatsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    portfolioStat: {
        marginLeft: 20,
        alignItems: 'center',
    },
    portfolioStatLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    portfolioStatValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    newsItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    newsTitle: {
        fontSize: 16,
        color: '#333',
        marginBottom: 4,
    },
    newsDate: {
        fontSize: 12,
        color: '#999',
    },
    floatingButton: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#0066CC',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
});

export default HomeScreen;