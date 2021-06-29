function StoreList(props) {

    const onClickFunction = (store) => {
        const newViewport = {
            longitude: parseFloat(store.longitude),
            latitude: parseFloat(store.latitude),
            zoom: 15
        }
        props.changeViewport(newViewport);
    }

    return (
        <div className="container">
            {props.stores.map((store) =>
                <button onClick={() => onClickFunction(store)} key={store.id} className="border border-primary rounded p-3 m-3">
                    <span>{store.name}</span>
                </button>
            )}
        </div>
    )
}

export default StoreList;