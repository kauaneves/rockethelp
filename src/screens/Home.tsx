import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { Center, FlatList, Heading, HStack, IconButton, Text, useTheme, VStack } from 'native-base';
import { ChatTeardropText, SignOut } from 'phosphor-react-native';
import { useEffect, useState } from 'react';

import { Alert } from 'react-native';
import Logo from '../assets/logo_secondary.svg';
import { Button } from '../components/Button';
import { Filter } from '../components/Filter';
import { Loading } from '../components/Loading';
import { Order, OrderProps } from '../components/Order';
import { dateFormat } from '../utils/firestoreDateFormat';

export function Home() {
  const { colors } = useTheme()

  const [loading, setLoading] = useState(true)
  const [statusSelected, setStatusSelected] = useState<'open' | 'closed'>('open')
  const [orders, setOrders] = useState<OrderProps[]>([])
  const navigation = useNavigation()

  function handleNewOrder() {
    navigation.navigate('new')
  }

  function handleOpenDetails(orderId: string) {
    navigation.navigate('details', { orderId })
  }

  function handleLogout() {
    auth()
    .signOut()
    .catch(error => {
      console.log(error)
      return Alert.alert('Sair', 'Não foi possível sair.')
    })
  }

  useEffect(() => {
    setLoading(true)

    const subscriber = firestore()
    .collection('orders')
    .where('status', '==', statusSelected)
    .onSnapshot(snapshot => {
      const data = snapshot.docs.map(doc => {
        const { patrimony, description, status, created_at } = doc.data()

        return {
          id: doc.id,
          patrimony,
          description,
          status,
          when: dateFormat(created_at)
        }
      })
      setOrders(data)
      setLoading(false)
    })

    return subscriber
  }, [statusSelected])

  return (
    <VStack flex={1} pb={6} bg='gray.700'>
      <HStack w='full' justifyContent='space-between' alignItems='center' bg='gray.600' pt={12} pb={5} px={6}>
        <Logo/>
        <IconButton icon={<SignOut size={26} color={colors.gray[300]} />} onPress={handleLogout} />
      </HStack>

      <VStack flex={1} px={6}>
      <HStack w='full' mt={8} mb={4} justifyContent='space-between' alignItems='center'>
        <Heading color='gray.100'>Meus Chamados</Heading>
        <Text color='gray.200'>{orders.length}</Text>
      </HStack>

      <HStack space={3} mb={8}>
        <Filter type='open' title='Em andamento' onPress={() => setStatusSelected('open')} isActive={statusSelected === 'open'}/>
        <Filter type='closed' title='Finalizado' onPress={() => setStatusSelected('closed')} isActive={statusSelected === 'closed'}/>
      </HStack>

      { loading ? <Loading/> : 
      <FlatList
      data={orders}
      keyExtractor={item => item.id}
      renderItem={({item}) => <Order data={item} onPress={() => handleOpenDetails(item.id)} />}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 50 }}
      ListEmptyComponent={() => (
        <Center>
          <ChatTeardropText color={colors.gray[300]} size={40} />
          <Text color='gray.300' fontSize='xl' mt={6} textAlign='center'>Você ainda não possui {'\n'} solicitações {statusSelected === 'open' ? 'em andamento' : 'finalizadas'}</Text>
        </Center>
      )}
    />
      }

      <Button title='Nova Solicitação' onPress={handleNewOrder}/>
      
      </VStack>
    </VStack>
  );
}