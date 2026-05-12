// classe ReportFragment
override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    super.onViewCreated(view, savedInstanceState)

    //Conectando o código ao botão do XML
    val btnEmergencia = view.findViewById<(R.id.btnEmergencia)

    btnEmergencia.setOnClickListener {
        println("Alerta: botão de Emergência acionado!")
    }
}