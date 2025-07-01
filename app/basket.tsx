import { View, Text, ScrollView, SafeAreaView, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import ItemsInCard from '@/components/items-modify-card'
import AppButton from '@/components/app-button'
import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import EmptyBasket from '@/components/empty-basket'

const Basket = () => {
    const router = useRouter()
    const [cleared, setCleared] = useState(false)

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.wrapper}>
                {!cleared ? (
                    <View style={styles.basketContainer}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Basket</Text>
                            <Text style={styles.subtitle}>Review and manage your order</Text>
                        </View>

                        <ScrollView
                            style={styles.scrollView}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.summaryCard}>
                                <View style={styles.summaryHeader}>
                                    <Text>Order Summary</Text>
                                    <Badge text='4 items' />
                                </View>

                                <View style={styles.summaryTotal}>
                                    <Text style={styles.totalLabel}>Order Summary</Text>
                                    <Text style={styles.totalAmount}>XAF 16.90</Text>
                                </View>
                            </View>

                            <View style={styles.itemsCard}>
                                <Text style={styles.itemsTitle}>Items in Basket</Text>
                                <Text style={styles.itemsSubtitle}>Modify quantities or remove items as needed</Text>

                                <ItemsInCard
                                    unitprice={0}
                                    availabe={0}
                                    name={'Fresh Croissants'}
                                />
                                <ItemsInCard
                                    unitprice={0}
                                    availabe={0}
                                    name={'Fresh Croissants'}
                                />
                                <ItemsInCard
                                    unitprice={0}
                                    availabe={0}
                                    name={'Fresh Croissants'}
                                />

                                <View style={styles.buttonContainer}>
                                    <AppButton
                                        onPress={() => router.push('/articles')}
                                        label={'Add more items'}
                                        className="flex items-center border-borders flex-row border justify-center p-3 rounded-lg w-fit"
                                        textClasses='text-center font-medium text-black'
                                    />
                                    <AppButton
                                        onPress={() => setCleared(true)}
                                        label={'Clear basket'}
                                        className="flex items-center border-borders flex-row border justify-center p-3 rounded-lg w-fit"
                                        textClasses='text-center font-medium text-red-500'
                                    />
                                </View>

                                <AppButton
                                    onPress={() => {}}
                                    label={'Place order'}
                                    className="flex items-center border-borders flex-row border bg-black justify-center p-3 rounded-lg w-full"
                                    textClasses='text-center font-medium text-white'
                                    icon={<MaterialIcons name="check" color="white" size={16} />}
                                />
                            </View>
                        </ScrollView>
                    </View>
                ) : (
                    <EmptyBasket />
                )}
            </View>
        </SafeAreaView>
    )
}

const Badge = ({text}: {text: string}) => {
    return (
        <View style={styles.badge}>
            <Text style={styles.badgeText}>{text}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    wrapper: {
        flex: 1,
    },
    basketContainer: {
        flex: 1,
        marginBottom: 40,
    },
    header: {
        backgroundColor: 'white',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#111827',
    },
    subtitle: {
        color: '#6B7280',
        marginTop: 4,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    summaryCard: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 8,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    summaryTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginTop: 20,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '600',
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: '600',
    },
    itemsCard: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 8,
        marginTop: 32,
    },
    itemsTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
    },
    itemsSubtitle: {
        color: '#6B7280',
        marginBottom: 40,
        marginTop: 4,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 12,
    },
    badge: {
        backgroundColor: '#F1F5F9',
        borderRadius: 9999,
        paddingVertical: 4,
        paddingHorizontal: 8,
        alignSelf: 'flex-start',
    },
    badgeText: {
        color: 'black',
        fontWeight: '500',
    },
})

export default Basket