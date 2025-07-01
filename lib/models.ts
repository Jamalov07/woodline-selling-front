export namespace ApiModels {
    export enum RoleName {
        admin,
        client,
        seller,
        provider,
        storekeeper,
    }

    export enum ActionMethod {
        get,
        post,
        put,
        patch,
        delete,
    }

    export enum PaymentMethod {
        cash_with_receipt, // Наличный с чеком
        cash_without_receipt, // Наличный без чека
        card_payme, // С карты PayMe
        card_uzum, // С карты Uzum
        card_anor, // С карты Anor
        card_solfy, // С карты Solfy
        card_zoodpay, // С карты ZoodPay
        card_to_card, // С карты на карту
        transfer, // Перечисление
        terminal, // Терминал
    }

    export enum PaymentCurrency {
        uzs,
        usd,
    }

    export enum ClientPStatus {
        first,
        next,
    }

    export enum OrderProductType {
        standart,
        nonstandart,
    }

    export enum ProductDirection {
        right,
        left,
        none,
    }

    export enum OrderProductStatus {
        new, // ns product default state
        accepted, // if ns product accepted by provider
        cancelled, // if all type cancelled
        sold, //sps product default state
        loaded, // if all type loaded
        received, // if all type received
    }

    export enum StorehouseType {
        warehouse,
        showroom,
    }

    export enum InventoryStatus {
        new,
        cancelled,
        accepted,
    }

    export enum ProductMVType {
        purchase,
        transfer,
    }

    export enum ProductType {
        standart,
        nonstandart,
    }

    export enum SPStatus {
        pending,
        active,
        defected,
    }

    export enum ProductMVStatus {
        active,
        defected,
    }

    export interface DefaultFields {
        id: string;
        createdAt: string;
        updatedAt?: string;
        deletedAt?: string;
    }

    export interface User extends DefaultFields {
        phone?: string;
        token?: string;
        source?: string;
        balance?: string;
        fullname?: string;
        password?: string;
        //=================
        storehouse?: Partial<ProviderStorehouse>;
        //======================
        actions?: Partial<Action>[];
        roles?: Partial<Role>[];
        models?: Partial<Model>[];
        carts?: Partial<Cart>[];
        orderProducts?: Partial<OrderProduct>[];
        bookings?: Partial<SPSBooking>[];
        soldToMe?: Partial<Order>[];
        soldByMe?: Partial<Order>[];
        sellings?: Partial<Selling>[];
        ppurchases?: Partial<Purchase>[];
        spurchases?: Partial<Purchase>[];
        inTransfers?: Partial<Transfer>[];
        outTransfers?: Partial<Transfer>[];
    }

    export interface ProviderStorehouse {
        providerId?: string;
        storehouseId?: string;
        //=================
        provider?: Partial<User>;
        storehouse?: Partial<Storehouse>;
    }

    export interface Action extends DefaultFields {
        url?: string;
        name?: string;
        method?: string;
        description?: string;
        //=================
        users?: Partial<User>[];
        roles?: Partial<Role>[];
    }

    export interface Role {
        name?: RoleName;
        //=================
        users?: Partial<User>[];
        actions?: Partial<Action>[];
    }

    export interface FurnitureType extends DefaultFields {
        name?: string;
        //======================
        models?: Partial<Model>[];
    }

    export interface PublicId extends Pick<DefaultFields, "id" | "createdAt"> {}

    export interface Model extends DefaultFields {
        name?: string;
        //======================
        providerId?: string;
        furnitureTypeId?: string;
        //======================
        provider?: Partial<User>;
        furnitureType?: Partial<FurnitureType>;
        //======================
        products?: Partial<Product>[];
    }

    export interface Payment extends DefaultFields {
        method: PaymentMethod;
        fromCurrency: PaymentCurrency;
        toCurrency: PaymentCurrency;
        //======================
        sum?: number;
        exchangeRate?: number;
        totalSum?: number;
        description?: string;
        //======================
        orderId?: string;
        //======================
        order?: Partial<Order>;
    }

    export interface Product extends DefaultFields {
        type: ProductType;
        direction: ProductDirection;
        //======================
        publicId?: string;
        tissue?: string;
        quantity?: string;
        description?: string;
        //======================
        modelId?: string;
        //======================
        model?: Partial<Model>;
        //======================
        productMVs?: Partial<ProductMV>[];
        SPs?: Partial<StorehouseProduct>[];
    }

    export interface Order extends DefaultFields {
        clientPStatus: ClientPStatus;
        status: InventoryStatus;
        //======================
        deliveryDate?: string;
        deliveryAddress?: string;
        //======================
        sellerId?: string;
        clientId?: string;
        //======================
        client?: Partial<User>;
        seller?: Partial<User>;
        //======================
        payments?: Partial<Payment>[];
        products?: Partial<Product>[];
    }

    export interface Cart extends DefaultFields {
        type: OrderProductType;
        //======================
        sale?: number;
        quantity?: number;
        price?: number;
        totalSum?: number;
        priceWithSale?: number;
        description?: string;
        //======================
        spsId?: string;
        sellerId?: string;
        //======================
        sps?: Partial<StorehouseProductStatus>;
        seller?: Partial<User>;
    }

    export interface OrderProduct extends DefaultFields {
        type: OrderProductType;
        status: OrderProductStatus;
        //======================
        sale?: number;
        quantity?: number;
        price?: number;
        totalSum?: number;
        priceWithSale?: number;
        description?: string;
        //======================
        spsId?: string;
        sellerId?: string;
        orderId?: string;
        //======================
        sps?: Partial<StorehouseProductStatus>;
        seller?: Partial<User>;
        order?: Partial<Order>;
        //======================
        selling: Partial<Selling>;
    }

    export interface Storehouse extends DefaultFields {
        type?: StorehouseType;
        //======================
        name?: string;
        //======================
        sellings?: Partial<Selling>[];
        purchases?: Partial<Purchase>[];
        provider?: Partial<ProviderStorehouse>[]; // it should be providers
        inTransfers?: Partial<Transfer>[];
        outTransfers?: Partial<Transfer>[];
        products?: Partial<StorehouseProduct>[];
    }

    export interface StorehouseProduct extends DefaultFields {
        productId?: string;
        storehouseId?: string;
        //======================
        product?: Partial<Product>;
        storehouse?: Partial<Storehouse>;
        //======================
        statuses?: Partial<StorehouseProductStatus>[];
    }

    export interface StorehouseProductStatus extends DefaultFields {
        status?: SPStatus;
        //======================
        quantity?: number;
        //======================
        spId?: string;
        //======================
        sp?: Partial<StorehouseProduct>;
        //======================
        bookings?: Partial<SPSBooking>[];
        carts?: Partial<Cart>[];
        orderProducts?: Partial<OrderProduct>[];
    }

    export interface SPSBooking extends DefaultFields {
        quantity: number;
        //======================
        sellerId?: string;
        spsId?: string;
        //======================
        seller?: Partial<User>;
        sps?: Partial<StorehouseProductStatus>;
    }

    export interface Selling extends DefaultFields {
        isAccepted?: boolean;
        //======================
        storekeeperId?: string;
        storehouseId?: string;
        orderProductId?: string;
        //======================
        storekeeper?: Partial<User>;
        storehouse?: Partial<Storehouse>;
        orderProduct?: Partial<OrderProduct>;
    }

    export interface Purchase extends DefaultFields {
        status: InventoryStatus;
        //======================
        providerId?: string;
        storekeeperId?: string;
        storehouseId?: string;
        //======================
        provider?: Partial<User>;
        storehouse?: Partial<Storehouse>;
        storekeeper?: Partial<User>;
        //======================
        productMVs?: Partial<ProductMV>[];
    }

    export interface Transfer extends DefaultFields {
        status?: InventoryStatus;
        //======================
        toStorekeeperId?: string;
        fromStorekeeperId?: string;
        toStorehouseId?: string;
        fromStorehouseId?: string;
        //======================
        toStorekeeper?: Partial<User>;
        toStorehouse?: Partial<Storehouse>;
        fromStorekeeper?: Partial<User>;
        fromStorehouse?: Partial<Storehouse>;
        //======================
        productMVs?: Partial<ProductMV>[];
    }

    export interface ProductMV extends DefaultFields {
        type?: ProductMVType;
        //======================
        productId?: string;
        purchaseId?: string;
        transferId?: string;
        //======================
        product?: Partial<Product>;
        purchase?: Partial<Purchase>;
        transfer?: Partial<Transfer>;
        //======================
        statuses?: Partial<ProductStatusMV>[];
    }

    export interface ProductStatusMV extends DefaultFields {
        status?: ProductMVStatus;
        //======================
        quantity?: number;
        //======================
        productMVId?: string;
        //======================
        productMV?: Partial<ProductMV>;
    }
}
