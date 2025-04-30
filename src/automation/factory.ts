export interface Factory<TProduct> {
    create(): TProduct | Promise<TProduct>;
}

export interface PayloadedFactory<TProduct, TPayload> {
    create(params: TPayload): TProduct | Promise<TProduct>;
}