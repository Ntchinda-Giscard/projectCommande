import { Alert } from "react-native"

// Define types (replace with actual types)
type CommandParams = {
  orderType: string
  date: string
  shipSite: string
  lines: Line[]
}

type Article = {
  itemCode: string
  description: string
  salesUoM: string
}

// Updated Line type to include salesUoM and make designation optional
type Line = {
  itemCode: string
  qty: number
  price?: number
  designation?: string // Keep as optional
  salesUoM?: string // Keep as optional
}

type BasketTotals = {
  hasCalculatedPrices: boolean
  totalPrice: number
  catalogTotal: number
}

// Define state variables (replace with actual state variables)
const basketLines: Line[] = []
const commandParams: CommandParams = { orderType: "", date: "", shipSite: "", lines: [] }
const selectedAddressCode: string = ""
const itemMtnetPrices: { [key: string]: number } = {}
const articles: Article[] = []
const basketTotals: BasketTotals = { hasCalculatedPrices: false, totalPrice: 0, catalogTotal: 0 }
const setLoadingPrices = (value: any) => {}
const setCommandParams = (value: any) => {}
const setItemMtnetPrices = (value: any) => {}
const setShowAddressPrompt = (value: any) => {}

// Define functions (replace with actual functions)
const createCommande = async (params: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true })
    }, 1000)
  })
}

const formatCurrency = (amount: number) => {
  return amount.toFixed(2)
}

const calculateUnitPriceFromMtnet = (mtnetTotal: number, qty: number) => {
  return mtnetTotal / qty
}

// Process order with calculated .MTNET prices, designation, and salesUoM
const processOrder = async () => {
  try {
    // Update lines with calculated unit prices from .MTNET and preserve designation and salesUoM
    const updatedLines = basketLines.map((line) => {
      const key = `${line.itemCode}-${line.qty}`
      const mtnetTotal = itemMtnetPrices[key] || 0
      const unitPrice = calculateUnitPriceFromMtnet(mtnetTotal, line.qty)
      const article = articles.find((a) => a.itemCode === line.itemCode)

      return {
        ...line,
        price: unitPrice > 0 ? unitPrice : line.price || 0,
        designation: line.designation || article?.description || `Article ${line.itemCode}`, // Provide default value
        salesUoM: line.salesUoM || article?.salesUoM || "UN", // Provide default value
      }
    })

    const updatedCommandParams = {
      ...commandParams,
      shipSite: selectedAddressCode,
      lines: updatedLines,
    }

    console.log("Processing order with .MTNET calculated prices, designations, and salesUoM:", updatedCommandParams)

    const result = await createCommande({
      username: "admin",
      password: "Wazasolutions2025@",
      moduleToImport: "YSOH",
      command: updatedCommandParams,
    })

    console.log("Order result:", result)

    const finalTotal = basketTotals.hasCalculatedPrices ? basketTotals.totalPrice : basketTotals.catalogTotal

    Alert.alert(
      "Succès",
      `Commande validée avec succès !\n\nRéférence: ${commandParams.orderType}-${commandParams.date}\nTotal: ${formatCurrency(finalTotal)}`,
      [
        {
          text: "OK",
          onPress: () => {
            setCommandParams({
              ...commandParams,
              lines: [],
            })
            setItemMtnetPrices({})
            setLoadingPrices({})
            setShowAddressPrompt(false)
          },
        },
      ],
    )
  } catch (error) {
    console.error("Order processing error:", error)
    Alert.alert("Erreur", "Une erreur s'est produite lors de la validation de votre commande.")
  }
}

export default processOrder
