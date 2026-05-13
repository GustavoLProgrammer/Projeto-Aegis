// classe ReportFragment
import android.widget.TextView
import android.widget.Button
import android.graphics.Color 

override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    super.onViewCreated(view, savedInstanceState)
    val tvTitulo = view.findViewById<TextView>(R.id.tvTitulo)

    //Conectando o código ao botão do XML
    val btnEmergencia = view.findViewById<(R.id.btnEmergencia)

    btnEmergencia.setOnClickListener {
        println("Alerta: botão de Emergência acionado!")
    }
    
    // Simula o início do sistema de monitoramento/quiz
    val btnAjuda = view.findViewById<Button>(R.id.btnAjuda)

    btnAjuda.setOnClickListener {
        tvTitulo.text = "Você está em perigo agora?"
        btnEmergencia.text = "SIM"
        btnAjuda.text = "NÃO"
        println("Quiz de monitoramento iniciado!")
    }
}