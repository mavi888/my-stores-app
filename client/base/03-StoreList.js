function StoreList(props) {

    return (
        <div className="container">
            {props.stores.map((store) =>
                <div key={store.id} className="border border-primary rounded p-3 m-3">
                    <span>{store.name}</span>
                </div>
            )}
        </div>
    )
}

export default StoreList;