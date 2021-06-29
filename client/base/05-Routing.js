import { useForm } from "react-hook-form";

function Routing(props) {

    const { register, handleSubmit } = useForm();
    const onSubmit = async (data) => {
        console.log(JSON.stringify(data));
        props.findRoute(data.from, data.to);
    }

    return (
        <div className="container">
            <h3>How to get to your fav store?</h3>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3 row">
                    <label className="col-sm-2 col-form-label">From:</label>
                    <input {...register("from")} type="text" className="form-control"></input>
                </div>
                <div className="mb-3 row">
                    <label className="col-sm-2 col-form-label" >To:</label>
                    <input  {...register("to")} className="form-control" list="datalistOptions" placeholder="Pick a store"></input>
                    <datalist id="datalistOptions">
                        {props.stores.map((item, key) => {
                            return <option key={key} value={item.name} />
                        })}
                    </datalist>
                </div>
                <button type="submit" className="btn btn-primary">Find the way</button>
            </form>
        </div>
    )
}

export default Routing;