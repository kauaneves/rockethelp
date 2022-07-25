import auth from '@react-native-firebase/auth';
import { Heading, Icon, useTheme, VStack } from "native-base";
import { Envelope, Key } from 'phosphor-react-native';
import { useState } from "react";
import { Alert } from "react-native";
import Logo from '../assets/logo_primary.svg';
import { Button } from "../components/Button";
import { Input } from "../components/Input";

export function SignIn() {
  const { colors } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  function handleSignIn() {
    if (!email || !password) {
      return Alert.alert('Entrar', 'Informe e-mail e senha')
    }

    setIsLoading(true)

    auth().signInWithEmailAndPassword(email, password)
    .catch((error) => {
      console.log(error)
      setIsLoading(false)

      if (error.code === 'auth/invalid-email') {
        return Alert.alert('Entrar', 'E-mail inválido.')
      }

      if (error.code === 'auth/wrong-password') {
        return Alert.alert('Entrar', 'E-mail ou senha inválido.')
      }

      if (error.code === 'auth/user-not-found') {
        return Alert.alert('Entrar', 'E-mail ou senha inválido.')
      }

      return Alert.alert('Entrar', 'Não foi possível acessar')
      
    })
  }

  return (
    <VStack flex={1} alignItems='center' bg='gray.600' px={8} pt={24}>
      <Logo />
      <Heading mb={6} fontSize='xl' color='gray.100' mt={20}>Acesse Sua Conta</Heading>
      <Input onChangeText={setEmail} mb={4} placeholder='E-mail' InputLeftElement={<Icon as={<Envelope color={colors.gray[300]}/>} ml={4}/>}/>
      <Input onChangeText={setPassword} mb={8} placeholder='Senha' secureTextEntry InputLeftElement={<Icon as={<Key color={colors.gray[300]}/>} ml={4}/>}/>
      <Button
      onPress={handleSignIn}
      title="Entrar"
      w='full' 
      isLoading={isLoading}
      />
    </VStack>
  )
}