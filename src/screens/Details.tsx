import firestore from '@react-native-firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Box, HStack, ScrollView, Text, useTheme, VStack } from 'native-base';
import { CircleWavyCheck, Clipboard, DesktopTower, Hourglass } from 'phosphor-react-native';
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Button } from '../components/Button';
import { CartDetails } from '../components/CartDetails';
import { Header } from '../components/Header';
import { Input } from '../components/Input';
import { Loading } from '../components/Loading';
import { OrderProps } from '../components/Order';
import { OrderFirestoreDTO } from '../DTOs/OrderDTO';
import { dateFormat } from '../utils/firestoreDateFormat';

type RouteParams = {
  orderId: string
}

type OrderDetails = OrderProps & {
  description: string
  solution: string
  closed: string
}

export function Details() {
  const [loading, setLoading] = useState(true)
  const [solution, setSolution] = useState('')
  const [order, setOrder] = useState<OrderDetails>({} as OrderDetails)
  const route = useRoute()
  const { orderId } = route.params as RouteParams
  const { colors } = useTheme()
  const navigation = useNavigation()

  function handleOrderClosed() {
    if (!solution) {
      return Alert.alert('Solicitação', 'Informe a solução para encerrar a solicitação')
    }

    firestore()
    .collection<OrderFirestoreDTO>('orders')
    .doc(orderId)
    .update({
      status: 'closed',
      solution,
      closed_at: firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
      Alert.alert('Solicitação', 'Solicitação encerrada')
      navigation.goBack()
    })
    .catch(error => {
      console.log(error)
      Alert.alert('Solicitação', 'Não foi possível encerrar a solicitação')
    })
  }

  useEffect(() => {
    firestore()
    .collection<OrderFirestoreDTO>('orders')
    .doc(orderId)
    .get()
    .then(doc => {
      const { patrimony, description, status, created_at, closed_at, solution } = doc.data()

      const closed = closed_at ? dateFormat(closed_at) : null

      setOrder({
        id: doc.id,
        patrimony,
        description,
        status,
        solution,
        when: dateFormat(created_at),
        closed
      })

      setLoading(false)
      
    })
  }, [])

  if (loading) {
    return <Loading/>
  }

  return (
    <VStack flex={1} bg='gray.700'>
      <Box px={6} bg='gray.600'>
        <Header title='Solicitação'/>
      </Box>
      <HStack bg='gray.500' justifyContent='center' p={4}>
      {
        order.status === 'closed' ?
          <CircleWavyCheck size={22} color={colors.green[300]}/>
        :
          <Hourglass size={22} color={colors.secondary[700]}/>
      }
      <Text fontSize='sm' color={order.status === 'closed' ? colors.green[300] : colors.secondary[700]} textTransform='uppercase'>{order.status === 'closed' ? 'finalizado' : 'em andamento'}</Text>
      </HStack>

      <ScrollView mx={5} showsVerticalScrollIndicator={false}>
        <CartDetails title='equipamento' description={`Patrimônio ${order.patrimony}`} icon={DesktopTower} footer={order.when} />
        <CartDetails title='descrição do problema' description={order.description} icon={Clipboard} />
        <CartDetails title='solução' icon={CircleWavyCheck} description={order.solution} footer={order.closed && `Encerrado em ${order.closed}`}>
          { order.status === 'open' &&
            <Input placeholder='Descrição da Solução' onChangeText={setSolution} textAlignVertical='top' multiline h={24} />
          }
        </CartDetails>
      </ScrollView>

      {
        order.status === 'open' && <Button title='Encerrar solicitação' m={5} onPress={handleOrderClosed} />
      }
    </VStack>
  );
}