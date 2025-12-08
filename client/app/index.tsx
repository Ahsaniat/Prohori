import { Redirect } from 'expo-router';

export default function Index() {
  // Logic to check if authenticated would go here
  // For now, always redirect to login
  return <Redirect href="/screens/login" />;
}