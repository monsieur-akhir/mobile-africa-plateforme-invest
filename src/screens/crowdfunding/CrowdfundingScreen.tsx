import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import {
  useNavigation,
  NavigationProp,
  ParamListBase,
  useFocusEffect,
} from '@react-navigation/native';
import { usePortfolio, AfricanExchange } from '../../hooks/usePortfolio';
import { Card, Button, Icon } from '@rneui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';

// Types pour les projets de crowdfunding
interface CrowdfundingProject {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  daysLeft: number;
  country: string;
  category: string;
  riskLevel: 'low' | 'medium' | 'high';
  exchange: AfricanExchange;
  imageUrl: string;
  backers: number;
}

// Navigation params
type RootStackParamList = ParamListBase & {
  NewProject: undefined;
  ProjectDetails: { projectId: string };
};

const CrowdfundingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { loading, refreshPrices, africanMarkets } = usePortfolio();
  const [refreshing, setRefreshing] = useState(false);
  const [activeExchange, setActiveExchange] = useState<AfricanExchange>('brvm');
  const [projects, setProjects] = useState<CrowdfundingProject[]>([]);
  const [featuredProject, setFeaturedProject] = useState<CrowdfundingProject | null>(null);

  // Récupère et filtre les projets
  const fetchProjects = useCallback(async () => {
    try {
      const mockProjects: CrowdfundingProject[] = [
        // ... vos projets mock ...
      ];
      const filtered = mockProjects.filter(p => p.exchange === activeExchange);
      setProjects(filtered);

      const featured = filtered.length
        ? filtered.reduce((max, p) => (p.currentAmount > max.currentAmount ? p : max), filtered[0])
        : null;
      setFeaturedProject(featured);
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Impossible de charger les projets de crowdfunding');
    }
  }, [activeExchange]);

  useFocusEffect(
    useCallback(() => {
      fetchProjects();
    }, [fetchProjects])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshPrices();
    await fetchProjects();
    setRefreshing(false);
  }, [refreshPrices, fetchProjects]);

  const handleExchangeChange = (exchange: AfricanExchange) => {
    setActiveExchange(exchange);
  };

  const handleProjectPress = (project: CrowdfundingProject) => {
    navigation.navigate('ProjectDetails', { projectId: project.id });
  };

  const renderProgressBar = (current: number, goal: number) => {
    const pct = Math.min((current / goal) * 100, 100);
    return (
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${pct}%` }]} />
        <Text style={styles.progressText}>{pct.toFixed(0)}%</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Chargement des projets...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* En-tête */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Investissement Participatif</Text>
          <Text style={styles.headerSubtitle}>Soutenez les projets en Afrique</Text>
        </View>

        {/* Sélecteur d'échange */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.exchangeSelector}>
          {Object.entries(africanMarkets).map(([key, market]) => (
            <TouchableOpacity
              key={key}
              style={[styles.exchangeButton, activeExchange === key && styles.exchangeButtonActive]}
              onPress={() => handleExchangeChange(key as AfricanExchange)}
            >
              <Text style={[styles.exchangeButtonText, activeExchange === key && styles.exchangeButtonTextActive]}>
                {market.name.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Info marché actif */}
        <View style={styles.marketInfoContainer}>
          <Text style={styles.marketName}>{africanMarkets[activeExchange].name}</Text>
          <Text style={styles.marketDetail}>
            Pays:{' '}
            {Array.isArray(africanMarkets[activeExchange].country)
              ? africanMarkets[activeExchange].country.join(', ')
              : africanMarkets[activeExchange].country}
          </Text>
          <Text style={styles.marketDetail}>Devise: {africanMarkets[activeExchange].currency}</Text>
        </View>

        {/* Projet en vedette */}
        {featuredProject && (
          <View style={styles.featuredContainer}>
            <Text style={styles.sectionTitle}>Projet en Vedette</Text>
            <TouchableOpacity onPress={() => handleProjectPress(featuredProject)}>
              <Card containerStyle={styles.featuredCard}>
                <View style={styles.cardImageContainer}>
                  <Image
                    source={{ uri: featuredProject.imageUrl }}
                    style={styles.featuredImage}
                    defaultSource={require('../../assets/placeholder.png')}
                  />
                  <View style={styles.riskBadge}>
                    <Text style={styles.riskText}>
                      Risque {featuredProject.riskLevel === 'low'
                        ? 'Faible'
                        : featuredProject.riskLevel === 'medium'
                        ? 'Moyen'
                        : 'Élevé'}
                    </Text>
                  </View>
                </View>

                <Card.Title style={styles.featuredTitle}>{featuredProject.title}</Card.Title>
                <Text style={styles.featuredDescription}>{featuredProject.description}</Text>
                {renderProgressBar(featuredProject.currentAmount, featuredProject.goalAmount)}
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {featuredProject.currentAmount.toLocaleString()} {africanMarkets[activeExchange].currency}
                    </Text>
                    <Text style={styles.statLabel}>Collectés</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{featuredProject.backers}</Text>
                    <Text style={styles.statLabel}>Investisseurs</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{featuredProject.daysLeft}</Text>
                    <Text style={styles.statLabel}>Jours restants</Text>
                  </View>
                </View>

                <Button
                  title="Investir maintenant"
                  buttonStyle={styles.investButton}
                  onPress={() => handleProjectPress(featuredProject)}
                />
              </Card>
            </TouchableOpacity>
          </View>
        )}

        {/* Liste des projets */}
        <View style={styles.projectsContainer}>
          <Text style={styles.sectionTitle}>Projets à découvrir</Text>
          {projects.length ? (
            projects.map(project => (
              <TouchableOpacity
                key={project.id}
                onPress={() => handleProjectPress(project)}
                style={styles.projectCard}
              >
                <Image
                  source={{ uri: project.imageUrl }}
                  style={styles.projectImage}
                  defaultSource={require('../../assets/placeholder.png')}
                />
                <View style={styles.projectInfo}>
                  <Text style={styles.projectTitle}>{project.title}</Text>
                  <Text style={styles.projectLocation}>{project.country}</Text>
                  <View style={styles.tagContainer}>
                    <Text style={styles.categoryTag}>{project.category}</Text>
                  </View>
                  {renderProgressBar(project.currentAmount, project.goalAmount)}
                  <View style={styles.projectStats}>
                    <Text style={styles.projectAmount}>
                      {project.currentAmount.toLocaleString()} {africanMarkets[activeExchange].currency}
                    </Text>
                    <Text style={styles.projectGoal}>
                      sur {project.goalAmount.toLocaleString()} {africanMarkets[activeExchange].currency}
                    </Text>
                    <Text style={styles.projectDays}>{project.daysLeft} jours restants</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucun projet disponible pour ce marché.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('NewProject')}>
          <Icon name="plus" type="font-awesome" color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CrowdfundingScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#555' },
  headerContainer: { padding: 20, backgroundColor: '#0066cc', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 16, color: '#e6e6e6', marginTop: 5 },
  exchangeSelector: { flexDirection: 'row', paddingVertical: 15, paddingHorizontal: 10 },
  exchangeButton: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginHorizontal: 5, backgroundColor: '#f0f0f0' },
  exchangeButtonActive: { backgroundColor: '#0066cc' },
  exchangeButtonText: { color: '#555', fontWeight: '500' },
  exchangeButtonTextActive: { color: '#fff' },
  marketInfoContainer: { backgroundColor: '#fff', marginHorizontal: 15, marginVertical: 10, padding: 15, borderRadius: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 },
  marketName: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  marketDetail: { fontSize: 14, color: '#666', marginBottom: 3 },
  featuredContainer: { marginTop: 10 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginHorizontal: 15, marginBottom: 10, color: '#333' },
  featuredCard: { borderRadius: 10, padding: 0, overflow: 'hidden' },
  cardImageContainer: { position: 'relative' },
  featuredImage: { width: '100%', height: 200, resizeMode: 'cover' },
  riskBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15 },
  riskText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  featuredTitle: { fontSize: 18, fontWeight: 'bold', paddingHorizontal: 15, paddingTop: 15, textAlign: 'left' },
  featuredDescription: { paddingHorizontal: 15, paddingVertical: 10, color: '#666', fontSize: 14 },
  progressContainer: { height: 15, backgroundColor: '#e0e0e0', borderRadius: 10, marginHorizontal: 15, marginVertical: 10, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 10 },
  progressText: { position: 'absolute', right: 5, top: -1, fontSize: 12, color: '#fff', fontWeight: 'bold' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 15, marginVertical: 10 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 12, color: '#666' },
  investButton: { backgroundColor: '#0066cc', borderRadius: 25, marginHorizontal: 15, marginVertical: 15, paddingVertical: 12 },
  projectsContainer: { marginTop: 20 },
  projectCard: { backgroundColor: '#fff', marginHorizontal: 15, marginBottom: 15, borderRadius: 10, padding: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, flexDirection: 'row' },
  projectImage: { width: 80, height: 80, borderRadius: 8 },
  projectInfo: { flex: 1, marginLeft: 12 },
  projectTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  projectLocation: { fontSize: 14, color: '#666', marginBottom: 4 },
  tagContainer: { flexDirection: 'row' },
  categoryTag: { fontSize: 12, backgroundColor: '#e0f7fa', color: '#0097a7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, overflow: 'hidden', marginRight: 5 },
  projectStats: { flexDirection: 'row', alignItems: 'baseline', marginTop: 5 },
  projectAmount: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  projectGoal: { fontSize: 14, color: '#666', marginLeft: 5 },
  projectDays: { fontSize: 14, color: '#0066cc', fontWeight: '500', marginLeft: 'auto' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 30 },
  emptyText: { marginTop: 10, color: '#666', textAlign: 'center', paddingHorizontal: 30 },
  fabContainer: { position: 'absolute', right: 20, bottom: 20 },
  fab: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#0066cc', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3 },
});


const styles2 = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
},
loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
},
loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
},
headerContainer: {
    padding: 20,
    backgroundColor: '#0066cc',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
},
headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
},
headerSubtitle: {
    fontSize: 16,
    color: '#e6e6e6',
    marginTop: 5,
},
exchangeSelector: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 10,
},
exchangeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: '#f0f0f0',
},
exchangeButtonActive: {
    backgroundColor: '#0066cc',
},
exchangeButtonText: {
    color: '#555',
    fontWeight: '500',
},
exchangeButtonTextActive: {
    color: '#fff',
},
marketInfoContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
},
marketName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
},
marketDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
},
featuredContainer: {
    marginTop: 10,
},
sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 15,
    marginBottom: 10,
    color: '#333',
},
featuredCard: {
    borderRadius: 10,
    padding: 0,
    overflow: 'hidden',
},
cardImageContainer: {
    position: 'relative',
},
featuredImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
},
riskBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
},
riskText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
},
featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 15,
    paddingTop: 15,
    textAlign: 'left',
},
featuredDescription: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: '#666',
    fontSize: 14,
},
progressContainer: {
    height: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    marginHorizontal: 15,
    marginVertical: 10,
    position: 'relative',
    overflow: 'hidden',
},
progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 10,
},
progressText: {
    position: 'absolute',
    right: 5,
    top: -1,
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
},
statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 15,
    marginVertical: 10,
},
statItem: {
    alignItems: 'center',
},
statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
},
statLabel: {
    fontSize: 12,
    color: '#666',
},
investButton: {
    backgroundColor: '#0066cc',
    borderRadius: 25,
    marginHorizontal: 15,
    marginVertical: 15,
    paddingVertical: 12,
},
investButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
},
projectsContainer: {
    marginTop: 20,
},
  projectCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    flexDirection: 'row',
},
projectImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
},
projectInfo: {
    flex: 1,
    marginLeft: 12,
},
projectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
},
projectLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
},
tagContainer: {
    flexDirection: 'row',
},
categoryTag: {
    fontSize: 12,
    backgroundColor: '#e0f7fa',
    color: '#0097a7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 5,
},
projectStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 5,
},
projectAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
},
projectGoal: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
},
projectDays: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '500',
    marginLeft: 'auto',
},
emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
},
emptyText: {
    marginTop: 10,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 30,
},
infoSection: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 10,
    padding: 15,
    marginBottom: 30,
},
infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
},
infoStep: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-start',
},
stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0066cc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
},
stepNumber: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
},
stepContent: {
    flex: 1,
},
stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
},
stepText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
},
fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
},
fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0066cc',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
},
});
