// Recipe Details Screen
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  Linking 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ScreenWrapper from '../../components/ScreenWrapper';
import { API_URL } from '../../constants/Config';

interface Ingredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
  original: string;
  image?: string;
}

interface Nutrient {
  name: string;
  amount: number;
  unit: string;
  percentOfDailyNeeds?: number;
}

interface RecipeDetails {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
  sourceName?: string;
  summary?: string;
  instructions?: string;
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  dairyFree: boolean;
  veryHealthy: boolean;
  healthScore?: number;
  pricePerServing?: number;
  extendedIngredients: Ingredient[];
  nutrition?: {
    nutrients: Nutrient[];
  };
  cuisines?: string[];
  dishTypes?: string[];
  diets?: string[];
}

function NutritionBadge({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <View className="items-center flex-1">
      <Text className={`text-lg font-bold ${color}`}>{Math.round(value)}</Text>
      <Text className="text-xs text-gray-500 dark:text-gray-400">{unit}</Text>
      <Text className="text-xs text-gray-600 dark:text-gray-300 mt-1">{label}</Text>
    </View>
  );
}

function DietBadge({ label, active }: { label: string; active: boolean }) {
  if (!active) return null;
  return (
    <View className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full mr-2 mb-2">
      <Text className="text-green-700 dark:text-green-400 text-xs font-medium">{label}</Text>
    </View>
  );
}

export default function RecipeDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [recipe, setRecipe] = useState<RecipeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullSummary, setShowFullSummary] = useState(false);

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_URL}/api/meals/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch recipe details');
        }
        
        const data = await response.json();
        setRecipe(data);
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError('Unable to load recipe details.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeDetails();
  }, [id]);

  const handleOpenSource = () => {
    if (recipe?.sourceUrl) {
      Linking.openURL(recipe.sourceUrl);
    }
  };

  // Strip HTML tags from summary
  const cleanSummary = (html: string) => {
    return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ');
  };

  // Get key nutrients
  const getKeyNutrients = () => {
    if (!recipe?.nutrition?.nutrients) return null;
    
    const nutrients = recipe.nutrition.nutrients;
    const calories = nutrients.find(n => n.name === 'Calories');
    const protein = nutrients.find(n => n.name === 'Protein');
    const carbs = nutrients.find(n => n.name === 'Carbohydrates');
    const fat = nutrients.find(n => n.name === 'Fat');
    
    return { calories, protein, carbs, fat };
  };

  if (loading) {
    return (
      <ScreenWrapper bg="bg-gray-50 dark:bg-black">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#9333EA" />
          <Text className="mt-4 text-gray-500 dark:text-gray-400">Loading recipe...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (error || !recipe) {
    return (
      <ScreenWrapper bg="bg-gray-50 dark:bg-black">
        <View className="flex-1 items-center justify-center px-4">
          <MaterialIcons name="error-outline" size={48} color="#EF4444" />
          <Text className="mt-4 text-gray-700 dark:text-gray-300 text-center">
            {error || 'Recipe not found'}
          </Text>
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mt-4 bg-purple-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  const nutrients = getKeyNutrients();

  return (
    <ScreenWrapper bg="bg-gray-50 dark:bg-black">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View className="relative">
          <Image
            source={{ uri: recipe.image }}
            className="w-full h-64"
            resizeMode="cover"
          />
          {/* Back Button */}
          <TouchableOpacity 
            onPress={() => router.back()}
            className="absolute top-12 left-4 bg-black/50 p-2 rounded-full"
          >
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          {/* Health Score */}
          {recipe.healthScore !== undefined && (
            <View className="absolute top-12 right-4 bg-green-500 px-3 py-1 rounded-full flex-row items-center">
              <MaterialIcons name="favorite" size={16} color="white" />
              <Text className="text-white font-bold ml-1">{recipe.healthScore}</Text>
            </View>
          )}
        </View>

        <View className="px-4 -mt-6">
          {/* Title Card */}
          <View className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm mb-4">
            <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {recipe.title}
            </Text>
            
            {/* Quick Info */}
            <View className="flex-row items-center mb-3">
              <View className="flex-row items-center mr-4">
                <MaterialIcons name="schedule" size={18} color="#9333EA" />
                <Text className="text-gray-600 dark:text-gray-400 ml-1">
                  {recipe.readyInMinutes} min
                </Text>
              </View>
              <View className="flex-row items-center mr-4">
                <MaterialIcons name="people" size={18} color="#9333EA" />
                <Text className="text-gray-600 dark:text-gray-400 ml-1">
                  {recipe.servings} servings
                </Text>
              </View>
              {recipe.pricePerServing && (
                <View className="flex-row items-center">
                  <MaterialIcons name="attach-money" size={18} color="#9333EA" />
                  <Text className="text-gray-600 dark:text-gray-400">
                    ${(recipe.pricePerServing / 100).toFixed(2)}/serving
                  </Text>
                </View>
              )}
            </View>

            {/* Diet Badges */}
            <View className="flex-row flex-wrap">
              <DietBadge label="Vegetarian" active={recipe.vegetarian} />
              <DietBadge label="Vegan" active={recipe.vegan} />
              <DietBadge label="Gluten Free" active={recipe.glutenFree} />
              <DietBadge label="Dairy Free" active={recipe.dairyFree} />
              <DietBadge label="Very Healthy" active={recipe.veryHealthy} />
            </View>
          </View>

          {/* Nutrition Card */}
          {nutrients && (
            <View className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm mb-4">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Nutrition per Serving
              </Text>
              <View className="flex-row">
                {nutrients.calories && (
                  <NutritionBadge 
                    label="Calories" 
                    value={nutrients.calories.amount} 
                    unit="kcal"
                    color="text-orange-500"
                  />
                )}
                {nutrients.protein && (
                  <NutritionBadge 
                    label="Protein" 
                    value={nutrients.protein.amount} 
                    unit="g"
                    color="text-red-500"
                  />
                )}
                {nutrients.carbs && (
                  <NutritionBadge 
                    label="Carbs" 
                    value={nutrients.carbs.amount} 
                    unit="g"
                    color="text-blue-500"
                  />
                )}
                {nutrients.fat && (
                  <NutritionBadge 
                    label="Fat" 
                    value={nutrients.fat.amount} 
                    unit="g"
                    color="text-yellow-500"
                  />
                )}
              </View>
            </View>
          )}

          {/* Summary */}
          {recipe.summary && (
            <View className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm mb-4">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                About
              </Text>
              <Text 
                className="text-gray-600 dark:text-gray-400 leading-6"
                numberOfLines={showFullSummary ? undefined : 4}
              >
                {cleanSummary(recipe.summary)}
              </Text>
              <TouchableOpacity onPress={() => setShowFullSummary(!showFullSummary)}>
                <Text className="text-purple-600 dark:text-purple-400 mt-2 font-medium">
                  {showFullSummary ? 'Show Less' : 'Read More'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Ingredients */}
          <View className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm mb-4">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Ingredients ({recipe.extendedIngredients.length})
            </Text>
            {recipe.extendedIngredients.map((ingredient, index) => (
              <View 
                key={`${ingredient.id}-${index}`}
                className="flex-row items-center py-2 border-b border-gray-100 dark:border-gray-800"
              >
                <MaterialIcons name="check-circle" size={20} color="#10B981" />
                <Text className="flex-1 ml-3 text-gray-700 dark:text-gray-300">
                  {ingredient.original}
                </Text>
              </View>
            ))}
          </View>

          {/* Cuisines & Dish Types */}
          {((recipe.cuisines && recipe.cuisines.length > 0) || (recipe.dishTypes && recipe.dishTypes.length > 0)) && (
            <View className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm mb-4">
              {recipe.cuisines && recipe.cuisines.length > 0 && (
                <View className="mb-3">
                  <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2">Cuisines</Text>
                  <View className="flex-row flex-wrap">
                    {recipe.cuisines.map((cuisine) => (
                      <View key={cuisine} className="bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full mr-2 mb-2">
                        <Text className="text-purple-700 dark:text-purple-400 text-sm">{cuisine}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              {recipe.dishTypes && recipe.dishTypes.length > 0 && (
                <View>
                  <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2">Dish Types</Text>
                  <View className="flex-row flex-wrap">
                    {recipe.dishTypes.map((type) => (
                      <View key={type} className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full mr-2 mb-2">
                        <Text className="text-blue-700 dark:text-blue-400 text-sm">{type}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Source Link */}
          <TouchableOpacity 
            onPress={handleOpenSource}
            className="bg-purple-600 rounded-2xl p-4 mb-6 flex-row items-center justify-center"
          >
            <MaterialIcons name="open-in-new" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">
              View Full Recipe on {recipe.sourceName || 'Source'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
