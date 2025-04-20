import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl, 
  Alert,
  Image,
  FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePortfolio, AfricanExchange } from '../../hooks/usePortfolio';
import { Card, Button, Icon, Divider } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

// Types pour les actifs du portefeuille
interface WalletAsset {
id: string;
symbol: string;
name: string;
quantity: number;
purchasePrice: number;
currentPrice: number;
exchange: AfricanExchange;
logoUrl: string;
change24h: number;
sector: string;
}

// Type pour les transactions
interface Transaction {
id: string;
type: 'buy' | 'sell';
symbol: string;
quantity: number;
price: number;
date: Date;
exchange: AfricanExchange;
total: number;
}

const WalletScreen: React.FC = () => {
const navigation = useNavigation<any>();
const { portfolio, loading, refreshPrices, getAfricanMarketInfo, africanMarkets } = usePortfolio();
const [refreshing, setRefreshing] = useState(false);
const [activeExchange, setActiveExchange] = useState<AfricanExchange>('brvm');
const [assets, setAssets] = useState<WalletAsset[]>([]);
const [transactions, setTransactions] = useState<Transaction[]>([]);
const [walletBalance, setWalletBalance] = useState({
    totalValue: 0,
    totalGain: 0,
    gainPercentage: 0
});
const [showAllAssets, setShowAllAssets] = useState(false);

// Fonction pour récupérer les données du portefeuille
const fetchWalletData = useCallback(async () => {
    try {
        // Simule des données de portefeuille
        const mockAssets: WalletAsset[] = [
            {
                id: '1',
                symbol: 'SNTS',
                name: 'Sonatel',
                quantity: 15,
                purchasePrice: 13500,
                currentPrice: 14200,
                exchange: 'brvm',
                logoUrl: 'https://example.com/sonatel.png',
                change24h: 2.3,
                sector: 'Télécommunications'
            },
            {
                id: '2',
                symbol: 'BICC',
                name: 'BICICI',
                quantity: 20,
                purchasePrice: 6300,
                currentPrice: 6500,
                exchange: 'brvm',
                logoUrl: 'https://example.com/bicici.png',
                change24h: 0.8,
                sector: 'Finance'
            },
            {
                id: '3',
                symbol: 'SGBC',
                name: 'Société Générale de Banques en Côte d\'Ivoire',
                quantity: 10,
                purchasePrice: 9800,
                currentPrice: 9750,
                exchange: 'brvm',
                logoUrl: 'https://example.com/sgbci.png',
                change24h: -0.5,
                sector: 'Finance'
            },
            {
                id: '4',
                symbol: 'ETIT',
                name: 'Ecobank Transnational Incorporated',
                quantity: 100,
                purchasePrice: 20,
                currentPrice: 22,
                exchange: 'brvm',
                logoUrl: 'https://example.com/ecobank.png',
                change24h: 3.1,
                sector: 'Finance'
            },
            {
                id: '5',
                symbol: 'PALC',
                name: 'Palm Côte d\'Ivoire',
                quantity: 30,
                purchasePrice: 3200,
                currentPrice: 3350,
                exchange: 'brvm',
                logoUrl: 'https://example.com/palm.png',
                change24h: 1.2,
                sector: 'Agriculture'
            }
        ];

        // Filtrer par bourse active
        const filteredAssets = mockAssets.filter(asset => asset.exchange === activeExchange);
        setAssets(filteredAssets);

        // Calculer le solde total et les gains
        const totalInvestment = filteredAssets.reduce((sum, asset) => 
            sum + (asset.purchasePrice * asset.quantity), 0);
        
        const currentValue = filteredAssets.reduce((sum, asset) => 
            sum + (asset.currentPrice * asset.quantity), 0);
        
        const totalGain = currentValue - totalInvestment;
        const gainPercentage = totalInvestment > 0 ? (totalGain / totalInvestment) * 100 : 0;
        
        setWalletBalance({
            totalValue: currentValue,
            totalGain: totalGain,
            gainPercentage: gainPercentage
        });

        // Simule des transactions récentes
        const mockTransactions: Transaction[] = [
            {
                id: 't1',
                type: 'buy',
                symbol: 'SNTS',
                quantity: 5,
                price: 13500,
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                exchange: 'brvm',
                total: 5 * 13500
            },
            {
                id: 't2',
                type: 'buy',
                symbol: 'BICC',
                quantity: 10,
                price: 6300,
                date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
                exchange: 'brvm',
                total: 10 * 6300
            },
            {
                id: 't3',
                type: 'sell',
                symbol: 'SGBC',
                quantity: 3,
                price: 9750,
                date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                exchange: 'brvm',
                total: 3 * 9750
            }
        ];

        setTransactions(mockTransactions.filter(tx => tx.exchange === activeExchange));
    } catch (error) {
        console.error('Erreur lors de la récupération des données du portefeuille:', error);
        Alert.alert('Erreur', 'Impossible de charger les données du portefeuille');
    }
}, [activeExchange]);

useFocusEffect(
    useCallback(() => {
        fetchWalletData();
    }, [fetchWalletData])
);

const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshPrices();
    await fetchWalletData();
    setRefreshing(false);
}, [refreshPrices, fetchWalletData]);

const navigateToMarketDetails = (symbol: string) => {
    // Navigation vers les détails du marché
    navigation.navigate('MarketDetail', { symbol, exchange: activeExchange });
};

const navigateToTransaction = () => {
    // Navigation vers l'écran de transaction (achat/vente)
    navigation.navigate('Transaction', { exchange: activeExchange });
};

const renderExchangeSelector = () => {
    return (
        <View style={styles.exchangeSelector}>
            <TouchableOpacity 
                style={[styles.exchangeButton, activeExchange === 'brvm' && styles.activeExchange]}
                onPress={() => setActiveExchange('brvm')}
            >
                <Text style={[styles.exchangeText, activeExchange === 'brvm' && styles.activeExchangeText]}>
                    BRVM
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.exchangeButton, activeExchange === 'jse' && styles.activeExchange]}
                onPress={() => setActiveExchange('jse')}
            >
                <Text style={[styles.exchangeText, activeExchange === 'jse' && styles.activeExchangeText]}>
                    JSE
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.exchangeButton, activeExchange === 'nse' && styles.activeExchange]}
                onPress={() => setActiveExchange('nse')}
            >
                <Text style={[styles.exchangeText, activeExchange === 'nse' && styles.activeExchangeText]}>
                    NSE
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const renderAssetItem = ({ item }: { item: WalletAsset }) => {
    const valueChange = item.currentPrice - item.purchasePrice;
    const percentChange = (valueChange / item.purchasePrice) * 100;
    const isPositive = valueChange >= 0;

    return (
        <TouchableOpacity 
            style={styles.assetItem}
            onPress={() => navigateToMarketDetails(item.symbol)}
        >
            <View style={styles.assetHeader}>
                <View style={styles.assetInfo}>
                    <Text style={styles.assetSymbol}>{item.symbol}</Text>
                    <Text style={styles.assetName}>{item.name}</Text>
                </View>
                <View>
                    <Text style={styles.assetPrice}>{item.currentPrice.toLocaleString()} FCFA</Text>
                    <Text style={[
                        styles.priceChange,
                        { color: isPositive ? '#4CAF50' : '#F44336' }
                    ]}>
                        {isPositive ? '+' : ''}{percentChange.toFixed(2)}%
                    </Text>
                </View>
            </View>
            <View style={styles.assetDetails}>
                <Text style={styles.assetQuantity}>{item.quantity} actions</Text>
                <Text style={styles.assetValue}>
                    Valeur: {(item.quantity * item.currentPrice).toLocaleString()} FCFA
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const renderTransactionItem = ({ item }: { item: Transaction }) => {
    return (
        <View style={styles.transactionItem}>
            <View style={styles.transactionIcon}>
                <Icon
                    name={item.type === 'buy' ? 'arrow-downward' : 'arrow-upward'}
                    type="material"
                    color={item.type === 'buy' ? '#4CAF50' : '#F44336'}
                    size={20}
                />
            </View>
            <View style={styles.transactionDetails}>
                <Text style={styles.transactionTitle}>
                    {item.type === 'buy' ? 'Achat' : 'Vente'} {item.symbol}
                </Text>
                <Text style={styles.transactionDate}>
                    {item.date.toLocaleDateString()}
                </Text>
            </View>
            <View style={styles.transactionAmount}>
                <Text style={styles.transactionValue}>
                    {item.type === 'buy' ? '-' : '+'}{item.total.toLocaleString()} FCFA
                </Text>
                <Text style={styles.transactionQuantity}>
                    {item.quantity} actions à {item.price.toLocaleString()} FCFA
                </Text>
            </View>
        </View>
    );
};

return (
    <SafeAreaView style={styles.container}>
        <ScrollView
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#2196F3']}
                />
            }
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mon Portefeuille</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                    <Icon name="settings" type="material" color="#333" size={24} />
                </TouchableOpacity>
            </View>

            {renderExchangeSelector()}

            <LinearGradient
                colors={['#2196F3', '#3F51B5']}
                style={styles.balanceCard}
            >
                <View>
                    <Text style={styles.balanceLabel}>Valeur totale</Text>
                    <Text style={styles.balanceValue}>
                        {walletBalance.totalValue.toLocaleString()} FCFA
                    </Text>
                </View>
                <View style={styles.balanceStats}>
                    <Text style={[
                        styles.gainValue,
                        { color: walletBalance.totalGain >= 0 ? '#FFFFFF' : '#FFCDD2' }
                    ]}>
                        {walletBalance.totalGain >= 0 ? '+' : ''}{walletBalance.totalGain.toLocaleString()} FCFA
                    </Text>
                    <Text style={[
                        styles.gainPercentage,
                        { color: walletBalance.gainPercentage >= 0 ? '#FFFFFF' : '#FFCDD2' }
                    ]}>
                        {walletBalance.gainPercentage >= 0 ? '+' : ''}{walletBalance.gainPercentage.toFixed(2)}%
                    </Text>
                </View>
            </LinearGradient>

            <View style={styles.actionsContainer}>
                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={navigateToTransaction}
                >
                    <LinearGradient
                        colors={['#4CAF50', '#2E7D32']}
                        style={styles.actionButtonGradient}
                    >
                        <Icon name="add" type="material" color="#FFF" size={24} />
                        <Text style={styles.actionButtonText}>Acheter</Text>
                    </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={navigateToTransaction}
                >
                    <LinearGradient
                        colors={['#F44336', '#C62828']}
                        style={styles.actionButtonGradient}
                    >
                        <Icon name="remove" type="material" color="#FFF" size={24} />
                        <Text style={styles.actionButtonText}>Vendre</Text>
                    </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('TransactionHistory')}
                >
                    <LinearGradient
                        colors={['#9E9E9E', '#616161']}
                        style={styles.actionButtonGradient}
                    >
                        <Icon name="history" type="material" color="#FFF" size={24} />
                        <Text style={styles.actionButtonText}>Historique</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Mes Actifs</Text>
                    <TouchableOpacity onPress={() => setShowAllAssets(!showAllAssets)}>
                        <Text style={styles.seeAllLink}>
                            {showAllAssets ? 'Réduire' : 'Voir tout'}
                        </Text>
                    </TouchableOpacity>
                </View>
                
                {loading ? (
                    <ActivityIndicator size="large" color="#2196F3" style={styles.loader} />
                ) : assets.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Icon name="account-balance" type="material" color="#BDBDBD" size={48} />
                        <Text style={styles.emptyStateText}>
                            Vous n'avez pas encore d'actifs sur {activeExchange.toUpperCase()}
                        </Text>
                        <Button
                            title="Commencer à investir"
                            onPress={() => navigation.navigate('Market')}
                            buttonStyle={styles.emptyStateButton}
                        />
                    </View>
                ) : (
                    <FlatList
                        data={showAllAssets ? assets : assets.slice(0, 3)}
                        renderItem={renderAssetItem}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                        ListFooterComponent={
                            !showAllAssets && assets.length > 3 ? (
                                <TouchableOpacity
                                    style={styles.showMoreButton}
                                    onPress={() => setShowAllAssets(true)}
                                >
                                    <Text style={styles.showMoreButtonText}>
                                        Afficher {assets.length - 3} actifs de plus
                                    </Text>
                                </TouchableOpacity>
                            ) : null
                        }
                    />
                )}
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Transactions Récentes</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('TransactionHistory')}>
                        <Text style={styles.seeAllLink}>Voir tout</Text>
                    </TouchableOpacity>
                </View>
                
                {transactions.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Icon name="sync" type="material" color="#BDBDBD" size={48} />
                        <Text style={styles.emptyStateText}>
                            Aucune transaction récente
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={transactions.slice(0, 3)}
                        renderItem={renderTransactionItem}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                    />
                )}
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Informations de marché BRVM</Text>
                </View>
                <View style={[styles.marketInfoCard, {backgroundColor: 'white', borderWidth: 1, borderColor: '#e1e8ee'}]}>
                    <Text style={styles.marketInfoTitle}>BRVM Composite</Text>
                    <View style={styles.marketInfoRow}>
                        <Text style={styles.marketInfoLabel}>Valeur actuelle:</Text>
                        <Text style={styles.marketInfoValue}>209,54 points</Text>
                    </View>
                    <View style={styles.marketInfoRow}>
                        <Text style={styles.marketInfoLabel}>Variation:</Text>
                        <Text style={[styles.marketInfoValue, styles.positiveChange]}>+0,74%</Text>
                    </View>
                    <View style={styles.marketInfoRow}>
                        <Text style={styles.marketInfoLabel}>Volume échangé:</Text>
                        <Text style={styles.marketInfoValue}>1,2 milliards FCFA</Text>
                    </View>
                    <Divider style={styles.divider} />
                    <Text style={styles.marketInfoTitle}>BRVM 10</Text>
                    <View style={styles.marketInfoRow}>
                        <Text style={styles.marketInfoLabel}>Valeur actuelle:</Text>
                        <Text style={styles.marketInfoValue}>159,36 points</Text>
                    </View>
                    <View style={styles.marketInfoRow}>
                        <Text style={styles.marketInfoLabel}>Variation:</Text>
                        <Text style={[styles.marketInfoValue, styles.positiveChange]}>+0,52%</Text>
                    </View>
                    <Button
                        title="Voir les marchés"
                        onPress={() => navigation.navigate('Market')}
                        buttonStyle={styles.marketInfoButton}
                    />
                </View>
            </View>
        </ScrollView>
    </SafeAreaView>
);
};

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
},
header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
},
headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
},
exchangeSelector: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    padding: 4,
},
exchangeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
},
activeExchange: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
},
exchangeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#757575',
},
activeExchangeText: {
    color: '#2196F3',
    fontWeight: 'bold',
},
balanceCard: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
},
balanceLabel: {
    fontSize: 14,
    color: '#E1F5FE',
    marginBottom: 4,
},
balanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
},
balanceStats: {
    alignItems: 'flex-end',
},
gainValue: {
    fontSize: 16,
    fontWeight: 'bold',
},
gainPercentage: {
    fontSize: 14,
    marginTop: 4,
},
actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 20,
},
actionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    overflow: 'hidden',
},
actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
},
actionButtonText: {
    marginLeft: 6,
    color: '#FFFFFF',
    fontWeight: 'bold',
},
section: {
    marginTop: 24,
    marginHorizontal: 16,
},
sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
},
sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
},
seeAllLink: {
    color: '#2196F3',
    fontSize: 14,
},
assetItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    elevation: 1,
},
assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
},
assetInfo: {
    flex: 1,
},
assetSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
},
assetName: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
},
assetPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
},
priceChange: {
    fontSize: 14,
    textAlign: 'right',
    marginTop: 2,
},
assetDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
},
assetQuantity: {
    fontSize: 14,
    color: '#757575',
},
assetValue: {
    fontSize: 14,
    color: '#757575',
},
showMoreButton: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginTop: 8,
},
showMoreButtonText: {
    color: '#2196F3',
    fontWeight: '500',
},
transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    elevation: 1,
},
transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
},
transactionDetails: {
    flex: 1,
},
transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
},
transactionDate: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
},
transactionAmount: {
    alignItems: 'flex-end',
},
transactionValue: {
    fontSize: 16,
    fontWeight: 'bold',
},
transactionQuantity: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
},
loader: {
    marginVertical: 20,
},
emptyState: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    marginVertical: 8,
},
emptyStateText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
},
emptyStateButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingHorizontal: 20,
},
marketInfoCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
},
marketInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
},
marketInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
},
marketInfoLabel: {
    fontSize: 14,
    color: '#757575',
},
marketInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
},
positiveChange: {
    color: '#4CAF50',
},
negativeChange: {
    color: '#F44336',
},
divider: {
    marginVertical: 12,
},
marketInfoButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    marginTop: 12,
},
});

export default WalletScreen;