const Button = ({

    children,
    variant = "primary",
    type = "button",
    className = "",
    ...props

}) => {

    const styles = {


        primary: "bg-[#26253A] hover:bg-white text-gray-400 hover:text-black ",

        secondary: "bg-white hover:bg-black text-gray-400 hover:text-white",

        ternary: "bg-[#26253A] hover:bg-white text-white hover:text-black"
    };

    return (
        <button type={type}
            className={`px-11 py-4 transition tracking-wider text-xl cursor-pointer ${styles[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    )

}

export default Button ;